import type { Dish } from './dishes';

// How the draw works
// ------------------
// A uniform draw over the pool ignores the one thing people actually care
// about: what lunch normally costs them. So each dish starts with a
// log-normal prior centred on ANCHOR, then the whole distribution is tilted
// by a single exponent until its expected price equals the user's budget.
// That is the maximum-entropy distribution with a fixed mean — the least
// opinionated way to hit a target average without hard-filtering the pool.
//
// Consequences worth knowing:
//   * A dish far from the budget stays reachable, just rarer.
//   * Adding three variants at one price does not triple that price's odds;
//     prior mass is split across dishes sharing a price.
//   * Favourites multiply weight; blocked dishes never reach this function.

const ANCHOR = 50;
const LOG_SPREAD = 0.42;
export const FAVORITE_BOOST = 3;

export type Selector = {
  pool: Dish[];
  weights: number[];
  weightOf: Map<string, number>;
  expectedPrice: number;
  pick(random?: () => number): Dish;
};

export function buildSelector(
  pool: Dish[],
  targetPrice: number,
  favorites: ReadonlySet<string> = new Set(),
): Selector | null {
  if (!pool.length) return null;
  if (pool.some((d) => !Number.isFinite(d.price) || d.price <= 0)) {
    throw new Error('Dish prices must be positive numbers');
  }

  const prices = pool.map((d) => d.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  // A budget outside the pool's range is not an error — the closest reachable
  // mean is the honest answer, and the UI reports the gap.
  const target = Math.min(Math.max(targetPrice, min), max);

  const perPrice = new Map<number, number>();
  for (const p of prices) perPrice.set(p, (perPrice.get(p) ?? 0) + 1);

  const logs = prices.map((p) => Math.log(p / ANCHOR));
  const prior = pool.map((d, i) => {
    const shape = -0.5 * (logs[i] / LOG_SPREAD) ** 2;
    const spread = -Math.log(perPrice.get(d.price)!);
    const boost = favorites.has(d.id) ? Math.log(FAVORITE_BOOST) : 0;
    return shape + spread + boost;
  });

  const weightsAt = (tilt: number) => {
    const logits = prior.map((p, i) => p + tilt * logs[i]);
    const anchor = Math.max(...logits);
    const raw = logits.map((x) => Math.exp(x - anchor));
    const sum = raw.reduce((s, x) => s + x, 0);
    return raw.map((x) => x / sum);
  };
  const meanOf = (w: number[]) => w.reduce((s, x, i) => s + x * prices[i], 0);

  let weights: number[];
  if (target === min || target === max) {
    // Degenerate ends: only dishes at that exact price can produce that mean.
    const hits = prices.filter((p) => p === target).length;
    weights = prices.map((p) => (p === target ? 1 / hits : 0));
  } else {
    let lo = -1;
    let hi = 1;
    while (meanOf(weightsAt(lo)) > target) lo *= 2;
    while (meanOf(weightsAt(hi)) < target) hi *= 2;
    for (let i = 0; i < 60; i++) {
      const mid = (lo + hi) / 2;
      if (meanOf(weightsAt(mid)) < target) lo = mid;
      else hi = mid;
    }
    weights = weightsAt((lo + hi) / 2);
  }

  return {
    pool,
    weights,
    weightOf: new Map(pool.map((d, i) => [d.id, weights[i]])),
    expectedPrice: meanOf(weights),
    pick(random = Math.random) {
      const draw = random();
      if (!Number.isFinite(draw) || draw < 0 || draw >= 1) {
        throw new Error('Random draw must be in [0, 1)');
      }
      let remaining = draw;
      for (let i = 0; i < pool.length; i++) {
        remaining -= weights[i];
        if (remaining < 0) return pool[i];
      }
      // Floating point can leave a sliver at the end; fall back to the last
      // dish that actually carries weight.
      for (let i = pool.length - 1; i >= 0; i--) if (weights[i] > 0) return pool[i];
      throw new Error('Pool has no reachable dish');
    },
  };
}
