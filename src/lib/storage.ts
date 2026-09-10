import { dishById, priceRarity, type Cuisine, type Dish, type Meal, type Tag } from './dishes';
import type { CafeTag, City } from './cafes';

// localStorage, not cookies: nothing here is ever sent to a server, and the
// cookie approach had to reject large pools at 3.5 KB. Everything is
// validated on read — a hand-edited or truncated value must not crash the app.

const NS = 'tnag.v2.';
export const MAX_CUSTOM = 60;
export const MAX_HISTORY = 300;
export const MAX_DIARY = 40;

export type Prefs = {
  lang: 'vi' | 'en';
  theme: 'dark' | 'light';
  sound: boolean;
  budget: number;
  /** 0 means no calorie ceiling. */
  kcalCap: number;
  /** 0 disables the recent-dish damping. */
  noRepeatDays: number;
  meal: Meal | 'any';
  cuisines: Cuisine[];
  include: Tag[];
  exclude: Tag[];
  city: City;
  radiusKm: number;
  cafeTags: CafeTag[];
};

export type CustomDish = {
  id: string;
  vi: string;
  price: number;
  veg: boolean;
  emoji: string;
  kcal: number;
};
export type Pool = { favorites: string[]; blocked: string[]; custom: CustomDish[] };
export type Spin = { id: string; at: number; price: number };

/** One eaten item. `portion` scales both kcal and price. */
export type DiaryItem = { id: string; portion: number; at: number };
export type Diary = { day: string; items: DiaryItem[] };

export type Body = {
  sex: 'm' | 'f';
  age: number;
  height: number;
  weight: number;
  activity: number;
  /** 0 means "use the calculated TDEE". */
  target: number;
};

export const defaultPrefs = (): Prefs => ({
  lang: 'vi',
  theme: 'dark',
  sound: true,
  budget: 50,
  kcalCap: 0,
  noRepeatDays: 0,
  meal: 'any',
  cuisines: [],
  include: [],
  exclude: [],
  city: 'hp',
  radiusKm: 20,
  cafeTags: [],
});
export const emptyPool = (): Pool => ({ favorites: [], blocked: [], custom: [] });
export const defaultBody = (): Body => ({
  sex: 'm',
  age: 28,
  height: 170,
  weight: 65,
  activity: 1.375,
  target: 0,
});

/** Local calendar day, not UTC: a food diary has to roll over at the user's
 *  own midnight, not at 07:00 because the server thinks in UTC. */
export function todayKey(now = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const emptyDiary = (): Diary => ({ day: todayKey(), items: [] });

const CUISINES: Cuisine[] = ['vn', 'cn', 'jp', 'kr', 'th', 'sea', 'in', 'mid', 'eu', 'us', 'mx'];
const TAGS: Tag[] = ['veg', 'spicy', 'soup', 'dry', 'rice', 'noodle', 'bread', 'grill', 'fried', 'light', 'seafood'];
const MEALS: (Meal | 'any')[] = ['any', 'sang', 'trua', 'toi'];
const CITIES: City[] = ['hp', 'hn', 'hcm'];
const CAFE_TAGS: CafeTag[] = [
  'view', 'work', 'garden', 'rooftop', 'vintage', 'book', 'chain', 'quiet', 'late', 'pet', 'photo',
];
const ACTIVITY_LEVELS = [1.2, 1.375, 1.55, 1.725, 1.9];

const strList = <T extends string>(value: unknown, allowed: readonly T[]): T[] =>
  Array.isArray(value) ? [...new Set(value.filter((v): v is T => allowed.includes(v as T)))] : [];

const clampInt = (value: unknown, lo: number, hi: number, fallback: number): number => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : fallback;
};

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
  return {
    lang: raw.lang === 'en' ? 'en' : 'vi',
    theme: raw.theme === 'light' ? 'light' : 'dark',
    sound: raw.sound !== false,
    budget: clampInt(raw.budget, 15, 300, base.budget),
    kcalCap: clampInt(raw.kcalCap, 0, 2000, 0),
    noRepeatDays: clampInt(raw.noRepeatDays, 0, 30, 0),
    meal: MEALS.includes(raw.meal as Meal) ? (raw.meal as Meal | 'any') : 'any',
    cuisines: strList(raw.cuisines, CUISINES),
    include: strList(raw.include, TAGS),
    exclude: strList(raw.exclude, TAGS),
    city: CITIES.includes(raw.city as City) ? (raw.city as City) : base.city,
    radiusKm: clampInt(raw.radiusKm, 1, 30, base.radiusKm),
    cafeTags: strList(raw.cafeTags, CAFE_TAGS),
  };
}

export function loadBody(): Body {
  const raw = read<Record<string, unknown>>('body');
  const base = defaultBody();
  if (!raw || typeof raw !== 'object') return base;
  const activity = Number(raw.activity);
  return {
    sex: raw.sex === 'f' ? 'f' : 'm',
    age: clampInt(raw.age, 10, 100, base.age),
    height: clampInt(raw.height, 120, 220, base.height),
    weight: clampInt(raw.weight, 25, 250, base.weight),
    activity: ACTIVITY_LEVELS.includes(activity) ? activity : base.activity,
    target: clampInt(raw.target, 0, 6000, 0),
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
  return {
    id: c.id,
    vi,
    price,
    veg: c.veg === true,
    emoji,
    kcal: clampInt(c.kcal, 0, 3000, Math.round(price * 7)),
  };
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
  const knownId = (id: unknown): id is string => typeof id === 'string' && (dishById.has(id) || seen.has(id));
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

/** Yesterday's diary is not today's: a stale day resets to an empty list. */
export function loadDiary(): Diary {
  const raw = read<Record<string, unknown>>('diary');
  if (!raw || typeof raw !== 'object' || typeof raw.day !== 'string' || raw.day !== todayKey()) {
    return emptyDiary();
  }
  const items: DiaryItem[] = [];
  if (Array.isArray(raw.items)) {
    for (const item of raw.items) {
      if (items.length >= MAX_DIARY) break;
      if (!item || typeof item !== 'object') continue;
      const d = item as Record<string, unknown>;
      const portion = Number(d.portion);
      const at = Number(d.at);
      if (typeof d.id !== 'string' || !Number.isFinite(portion) || portion <= 0 || portion > 5) continue;
      items.push({ id: d.id, portion, at: Number.isFinite(at) && at > 0 ? at : Date.now() });
    }
  }
  return { day: raw.day, items };
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
    kcal: custom.kcal,
    custom: true,
  };
}

// Lives in its own module so the Node test runner can load it without this
// file's extensionless './dishes' import. Re-exported to keep one import path.
export { tdee } from './tdee';
