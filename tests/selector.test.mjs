import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSelector,
  withinBudget,
  BUDGET_MEAN_RATIO,
  FAVORITE_BOOST,
  REPEAT_DAMP,
} from '../src/lib/selector.ts';
import { dishes } from '../src/lib/dishes.ts';
import { cafes } from '../src/lib/cafes.ts';
import { tdee } from '../src/lib/tdee.ts';
import { mulberry32, roomSeed } from '../src/lib/rng.ts';

const dish = (id, price) => ({
  id,
  vi: id,
  en: id,
  price,
  emoji: '🍚',
  cuisine: 'vn',
  tags: [],
  meals: ['trua'],
  rarity: 0,
});

const pool = [25, 35, 45, 55, 70, 90, 120, 180].map((p, i) => dish(`d${i}`, p));

test('weights form a probability distribution', () => {
  const s = buildSelector(pool, 50);
  const total = s.weights.reduce((a, b) => a + b, 0);
  assert.ok(Math.abs(total - 1) < 1e-9, `weights sum to ${total}`);
  assert.ok(s.weights.every((w) => w >= 0));
});

test('expected price matches the budget', () => {
  for (const target of [30, 45, 50, 80, 140]) {
    const s = buildSelector(pool, target);
    assert.ok(
      Math.abs(s.expectedPrice - target) < 0.01,
      `target ${target} produced mean ${s.expectedPrice}`,
    );
  }
});

test('a budget outside the pool clamps to the nearest reachable price', () => {
  assert.equal(buildSelector(pool, 5).expectedPrice, 25);
  assert.equal(buildSelector(pool, 5000).expectedPrice, 180);
});

test('favourites are boosted relative to an equally priced dish', () => {
  const twins = [dish('plain', 50), dish('loved', 50), dish('cheap', 30), dish('rich', 90)];
  const s = buildSelector(twins, 50, new Set(['loved']));
  const ratio = s.weightOf.get('loved') / s.weightOf.get('plain');
  assert.ok(Math.abs(ratio - FAVORITE_BOOST) < 1e-6, `expected ${FAVORITE_BOOST}x, got ${ratio}`);
});

test('variants at one price do not inflate that price band', () => {
  const single = buildSelector([dish('a', 40), dish('b', 60)], 50);
  const tripled = buildSelector([dish('a', 40), dish('b1', 60), dish('b2', 60), dish('b3', 60)], 50);
  const bandSingle = single.weightOf.get('b');
  const bandTripled =
    tripled.weightOf.get('b1') + tripled.weightOf.get('b2') + tripled.weightOf.get('b3');
  assert.ok(Math.abs(bandSingle - bandTripled) < 1e-9);
});

test('sampling converges on the expected price', () => {
  const s = buildSelector(pool, 60);
  const random = mulberry32(12345);
  let sum = 0;
  const runs = 40000;
  for (let i = 0; i < runs; i++) sum += s.pick(random).price;
  const mean = sum / runs;
  assert.ok(Math.abs(mean - 60) < 2, `sampled mean ${mean} drifted from 60`);
});

test('an empty pool yields no selector', () => {
  assert.equal(buildSelector([], 50), null);
});

test('the budget is a hard ceiling, never exceeded by a draw', () => {
  for (const cap of [25, 45, 90, 180]) {
    const affordable = withinBudget(pool, cap);
    assert.ok(
      affordable.every((d) => d.price <= cap),
      `a dish above ${cap} survived the cap`,
    );
    const s = buildSelector(affordable, cap * BUDGET_MEAN_RATIO);
    const random = mulberry32(7);
    for (let i = 0; i < 5000; i++) {
      const drawn = s.pick(random);
      assert.ok(drawn.price <= cap, `drew ${drawn.price} under a ${cap} cap`);
    }
  }
});

test('a cap under every price falls back to the cheapest dishes', () => {
  const affordable = withinBudget(pool, 5);
  assert.deepEqual(
    affordable.map((d) => d.price),
    [25],
  );
  assert.equal(withinBudget([], 5).length, 0);
});

test('capping keeps the pool varied instead of collapsing onto the cap', () => {
  // Aiming the mean at the cap itself puts almost all mass on the dishes
  // priced exactly there; aiming below it must stay far more spread out.
  const affordable = withinBudget(pool, 90);
  const entropy = (s) =>
    -s.weights.reduce((acc, w) => acc + (w > 0 ? w * Math.log2(w) : 0), 0);
  const atCap = entropy(buildSelector(affordable, 90));
  const belowCap = entropy(buildSelector(affordable, 90 * BUDGET_MEAN_RATIO));
  assert.ok(belowCap > atCap + 1, `entropy ${belowCap} was not clearly above ${atCap}`);
});

test('a bad draw is rejected rather than silently clamped', () => {
  const s = buildSelector(pool, 50);
  assert.throws(() => s.pick(() => 1), /\[0, 1\)/);
  assert.throws(() => s.pick(() => NaN), /\[0, 1\)/);
});

test('a recently drawn dish is damped, not banned', () => {
  const twins = [dish('fresh', 50), dish('justHad', 50), dish('cheap', 30), dish('rich', 90)];
  const s = buildSelector(twins, 50, new Set(), new Set(['justHad']));
  const ratio = s.weightOf.get('justHad') / s.weightOf.get('fresh');
  assert.ok(Math.abs(ratio - REPEAT_DAMP) < 1e-6, `expected ${REPEAT_DAMP}x, got ${ratio}`);
  assert.ok(s.weightOf.get('justHad') > 0, 'a damped dish must stay reachable');
});

test('every catalogue dish carries a plausible calorie figure', () => {
  for (const d of dishes) {
    assert.ok(Number.isFinite(d.kcal), `${d.id} has no kcal`);
    assert.ok(d.kcal >= 150 && d.kcal <= 1200, `${d.id} kcal ${d.kcal} is out of range`);
  }
});

test('every café resolves to a known area distance', () => {
  // 99 is the sentinel for an area missing from AREA_KM, which would silently
  // hide the café from every radius.
  const orphans = cafes.filter((c) => c.km === 99).map((c) => `${c.name} (${c.area})`);
  assert.deepEqual(orphans, []);
  assert.ok(cafes.filter((c) => c.city === 'hp').length >= 20, 'Hải Phòng needs a decent list');
  assert.equal(new Set(cafes.map((c) => c.id)).size, cafes.length, 'duplicate café id');
});

test('TDEE follows Mifflin-St Jeor', () => {
  // 10*70 + 6.25*175 - 5*30 + 5 = 1648.75 BMR, x1.55 = 2555.6 -> 2556
  const value = tdee({ sex: 'm', age: 30, height: 175, weight: 70, activity: 1.55, target: 0 });
  assert.equal(value, 2556);
  const female = tdee({ sex: 'f', age: 30, height: 175, weight: 70, activity: 1.55, target: 0 });
  assert.ok(female < value, 'the female constant must lower the estimate');
});

test('the same room and day pick the same dish', () => {
  const s = buildSelector(pool, 50);
  const a = s.pick(mulberry32(roomSeed('Team Backend', '2026-09-10')));
  const b = s.pick(mulberry32(roomSeed('team backend ', '2026-09-10')));
  assert.equal(a.id, b.id);
  assert.notEqual(roomSeed('team backend', '2026-09-10'), roomSeed('team backend', '2026-09-11'));
});
