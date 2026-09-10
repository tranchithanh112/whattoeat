import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildSelector, FAVORITE_BOOST } from '../src/lib/selector.ts';
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

test('a bad draw is rejected rather than silently clamped', () => {
  const s = buildSelector(pool, 50);
  assert.throws(() => s.pick(() => 1), /\[0, 1\)/);
  assert.throws(() => s.pick(() => NaN), /\[0, 1\)/);
});

test('the same room and day pick the same dish', () => {
  const s = buildSelector(pool, 50);
  const a = s.pick(mulberry32(roomSeed('Team Backend', '2026-09-10')));
  const b = s.pick(mulberry32(roomSeed('team backend ', '2026-09-10')));
  assert.equal(a.id, b.id);
  assert.notEqual(roomSeed('team backend', '2026-09-10'), roomSeed('team backend', '2026-09-11'));
});
