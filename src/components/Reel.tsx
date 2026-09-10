import { useCallback, useEffect, useImperativeHandle, useRef, useState, type RefObject } from 'react';
import type { Dish } from '@/lib/dishes';
import type { Sfx } from '@/lib/audio';
import type { Lang } from '@/lib/i18n';
import { DishCard } from './DishCard';

export const STEP = 176; // card width + gap, mirrored in styles.css
const STRIP = 48;
const WINNER_AT = 41;

export type ReelHandle = { run: (winner: Dish, filler: () => Dish, onDone: () => void) => void };

type Props = {
  handle: RefObject<ReelHandle | null>;
  lang: Lang;
  idle: Dish[];
  sfx: Sfx;
  onSpinningChange: (spinning: boolean) => void;
};

/**
 * The strip is rebuilt for every spin and animated exactly once, rather than
 * recycled at world coordinates. Forty-eight cards is nothing for the DOM and
 * it removes a whole class of drift bugs at the cost of one array rebuild.
 */
export function Reel({ handle, lang, idle, sfx, onSpinningChange }: Props) {
  const [strip, setStrip] = useState<Dish[]>(() => idle.slice(0, 12));
  const track = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const busy = useRef(false);

  // While idle the strip mirrors the current pool, so filter changes are
  // visible before anyone presses the button.
  useEffect(() => {
    if (!busy.current) setStrip(idle.slice(0, 12));
  }, [idle]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const run = useCallback(
    (winner: Dish, filler: () => Dish, onDone: () => void) => {
      const view = viewport.current;
      const node = track.current;
      if (busy.current || !view || !node) return;
      busy.current = true;
      onSpinningChange(true);

      const cards: Dish[] = [];
      for (let i = 0; i < STRIP; i++) cards.push(i === WINNER_AT ? winner : filler());
      setStrip(cards);

      const centre = view.clientWidth / 2;
      const start = centre - STEP / 2 - 2 * STEP;
      // Stop off-centre by a random slice of the card, so the reel never
      // lands with suspicious precision.
      const jitter = (Math.random() - 0.5) * STEP * 0.62;
      const end = centre - STEP / 2 - WINNER_AT * STEP + jitter;
      const duration = 5200 + Math.random() * 1400;
      const friction = 3.1 + Math.random() * 0.7;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      node.style.transform = `translate3d(${start}px,0,0)`;
      sfx.open();

      const began = performance.now();
      let lastCell = Math.floor((start - centre) / STEP);

      const step = (now: number) => {
        const p = Math.min(1, (now - began) / (reduced ? 240 : duration));
        const eased = 1 - Math.pow(1 - p, friction);
        const x = start + (end - start) * eased;
        node.style.transform = `translate3d(${x}px,0,0)`;

        const cell = Math.floor((x - centre) / STEP);
        if (cell !== lastCell) {
          sfx.tick(p);
          lastCell = cell;
        }

        if (p < 1) {
          frame.current = requestAnimationFrame(step);
          return;
        }
        busy.current = false;
        onSpinningChange(false);
        sfx.reveal(winner.rarity);
        onDone();
      };
      frame.current = requestAnimationFrame(step);
    },
    [onSpinningChange, sfx],
  );

  useImperativeHandle(handle, () => ({ run }), [run]);

  return (
    <div className="reel" ref={viewport}>
      <div className="reel-marker" aria-hidden="true" />
      <div className="reel-track" ref={track}>
        {strip.map((dish, i) => (
          <DishCard key={`${i}-${dish.id}`} dish={dish} lang={lang} />
        ))}
      </div>
      <div className="reel-fade left" aria-hidden="true" />
      <div className="reel-fade right" aria-hidden="true" />
    </div>
  );
}
