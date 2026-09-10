import type { Dish } from './dishes';
import { copy, dishName, dishSubtitle, priceLabel, type Lang } from './i18n';

// A share card drawn on a canvas rather than rasterised from the DOM: no
// html2canvas dependency, no webfont round-trip, and the output is a fixed
// 1080x1350 portrait that story and feed uploads accept as-is.

const W = 1080;
const H = 1350;
const RARITY = ['#7ba05b', '#e0a53a', '#e2683f', '#d1477f', '#f2c14e'];

function hueOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Returns false when the browser refuses to produce a blob. */
export async function saveShareImage(dish: Dish, lang: Lang): Promise<boolean> {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const t = copy[lang];
  const accent = RARITY[Math.min(dish.rarity, RARITY.length - 1)];
  const hue = hueOf(dish.id);

  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#1b1613');
  bg.addColorStop(1, '#14110f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // The plate, close enough to the on-screen art to be recognisable.
  const cx = W / 2;
  const cy = 520;
  const r = 250;
  const plate = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
  plate.addColorStop(0, `hsl(${hue} 74% 64%)`);
  plate.addColorStop(0.56, `hsl(${hue} 58% 44%)`);
  plate.addColorStop(1, `hsl(${hue} 48% 28%)`);
  ctx.fillStyle = plate;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '220px system-ui, "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
  ctx.fillText(dish.emoji, cx, cy + 12);

  ctx.fillStyle = accent;
  ctx.font = 'bold 34px system-ui, "Segoe UI", sans-serif';
  ctx.fillText(t.tiers[dish.rarity].toUpperCase(), cx, 180);

  // Long Vietnamese names need wrapping; two lines is the practical limit.
  ctx.fillStyle = '#f5ece1';
  ctx.font = 'bold 76px system-ui, "Segoe UI", sans-serif';
  const lines: string[] = [];
  let line = '';
  for (const word of dishName(dish, lang).split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width > W - 160 && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  lines.push(line);
  const shown = lines.slice(0, 2);
  shown.forEach((text, i) => ctx.fillText(text, cx, 880 + i * 88));
  const below = 880 + shown.length * 88;

  ctx.fillStyle = '#a99c8e';
  ctx.font = '38px system-ui, "Segoe UI", sans-serif';
  ctx.fillText(dishSubtitle(dish, lang), cx, below + 30);

  ctx.fillStyle = '#f0a13a';
  ctx.font = 'bold 46px system-ui, "Segoe UI", sans-serif';
  ctx.fillText(`${priceLabel(dish.price, lang, true)} · ~${dish.kcal} ${t.kcal}`, cx, below + 110);

  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  roundRect(ctx, cx - 260, H - 150, 520, 76, 38);
  ctx.fill();
  ctx.fillStyle = '#f5ece1';
  ctx.font = '36px system-ui, "Segoe UI", sans-serif';
  ctx.fillText('whattoeatvn.vercel.app', cx, H - 110);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) return false;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `whattoeat-${dish.id}.png`;
  link.click();
  // Revoking immediately can cancel the download in some browsers.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return true;
}
