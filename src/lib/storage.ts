import { dishById, priceRarity, type Cuisine, type Dish, type Meal, type Tag } from './dishes';

// localStorage, not cookies: nothing here is ever sent to a server, and the
// cookie approach had to reject large pools at 3.5 KB. Everything is
// validated on read — a hand-edited or truncated value must not crash the app.

const NS = 'tnag.v2.';
export const MAX_CUSTOM = 60;
export const MAX_HISTORY = 300;

export type Prefs = {
  lang: 'vi' | 'en';
  theme: 'dark' | 'light';
  sound: boolean;
  budget: number;
  meal: Meal | 'any';
  cuisines: Cuisine[];
  include: Tag[];
  exclude: Tag[];
};

export type CustomDish = { id: string; vi: string; price: number; veg: boolean; emoji: string };
export type Pool = { favorites: string[]; blocked: string[]; custom: CustomDish[] };
export type Spin = { id: string; at: number; price: number };

export const defaultPrefs = (): Prefs => ({
  lang: 'vi',
  theme: 'dark',
  sound: true,
  budget: 50,
  meal: 'any',
  cuisines: [],
  include: [],
  exclude: [],
});
export const emptyPool = (): Pool => ({ favorites: [], blocked: [], custom: [] });

const CUISINES: Cuisine[] = ['vn', 'cn', 'jp', 'kr', 'th', 'sea', 'in', 'mid', 'eu', 'us', 'mx'];
const TAGS: Tag[] = ['veg', 'spicy', 'soup', 'dry', 'rice', 'noodle', 'bread', 'grill', 'fried', 'light', 'seafood'];
const MEALS: (Meal | 'any')[] = ['any', 'sang', 'trua', 'toi'];

const strList = <T extends string>(value: unknown, allowed: readonly T[]): T[] =>
  Array.isArray(value) ? [...new Set(value.filter((v): v is T => allowed.includes(v as T)))] : [];

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(NS + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Returns false when storage is unavailable (private mode, quota, blocked). */
export function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(NS + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadPrefs(): Prefs {
  const raw = read<Record<string, unknown>>('prefs');
  const base = defaultPrefs();
  if (!raw || typeof raw !== 'object') return base;
  const budget = Number(raw.budget);
  return {
    lang: raw.lang === 'en' ? 'en' : 'vi',
    theme: raw.theme === 'light' ? 'light' : 'dark',
    sound: raw.sound !== false,
    budget: Number.isFinite(budget) ? Math.min(300, Math.max(15, Math.round(budget))) : base.budget,
    meal: MEALS.includes(raw.meal as Meal) ? (raw.meal as Meal | 'any') : 'any',
    cuisines: strList(raw.cuisines, CUISINES),
    include: strList(raw.include, TAGS),
    exclude: strList(raw.exclude, TAGS),
  };
}

function validCustom(value: unknown): CustomDish | null {
  if (!value || typeof value !== 'object') return null;
  const c = value as Record<string, unknown>;
  const vi = typeof c.vi === 'string' ? c.vi.trim().normalize('NFC') : '';
  const price = Number(c.price);
  if (typeof c.id !== 'string' || !/^c-[0-9a-z]{4,24}$/.test(c.id)) return null;
  // Control characters would break reel labels and any shared link.
  if (!vi || vi.length > 60 || /[\u0000-\u001f\u007f]/.test(vi)) return null;
  if (!Number.isInteger(price) || price < 5 || price > 999) return null;
  const emoji = typeof c.emoji === 'string' && c.emoji.length > 0 && c.emoji.length <= 4 ? c.emoji : '🍽️';
  return { id: c.id, vi, price, veg: c.veg === true, emoji };
}

export function loadPool(): Pool {
  const raw = read<Record<string, unknown>>('pool');
  if (!raw || typeof raw !== 'object') return emptyPool();
  const custom: CustomDish[] = [];
  const seen = new Set<string>();
  if (Array.isArray(raw.custom)) {
    for (const item of raw.custom) {
      const dish = validCustom(item);
      if (dish && !seen.has(dish.id) && custom.length < MAX_CUSTOM) {
        seen.add(dish.id);
        custom.push(dish);
      }
    }
  }
  // Favourites and blocks may reference catalogue dishes or the user's own;
  // anything else is stale and gets dropped.
  const knownId = (id: unknown): id is string =>
    typeof id === 'string' && (dishById.has(id) || seen.has(id));
  const idList = (list: unknown) => (Array.isArray(list) ? [...new Set(list.filter(knownId))] : []);
  return { favorites: idList(raw.favorites), blocked: idList(raw.blocked), custom };
}

export function loadHistory(): Spin[] {
  const raw = read<unknown>('history');
  if (!Array.isArray(raw)) return [];
  const out: Spin[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const s = item as Record<string, unknown>;
    const at = Number(s.at);
    const price = Number(s.price);
    if (typeof s.id !== 'string' || !Number.isFinite(at) || at <= 0 || !Number.isFinite(price)) continue;
    out.push({ id: s.id, at, price });
  }
  return out.slice(-MAX_HISTORY);
}

export const newCustomId = (): string =>
  'c-' + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

/** Custom dishes join the catalogue as first-class dishes so the reel, the
 *  weighting and the stats all treat them identically. */
export function toDish(custom: CustomDish): Dish {
  return {
    id: custom.id,
    vi: custom.vi,
    en: custom.vi,
    price: custom.price,
    emoji: custom.emoji,
    cuisine: 'vn',
    tags: custom.veg ? ['veg'] : [],
    meals: ['sang', 'trua', 'toi'],
    rarity: priceRarity(custom.price),
    custom: true,
  };
}
