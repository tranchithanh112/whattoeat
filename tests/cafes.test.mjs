import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cafes,
  filterCafes,
  cafeEmoji,
  mapsUrl,
  brandOf,
  pickCafe,
  priceBand,
} from '../src/lib/cafes.ts';
import { mulberry32 } from '../src/lib/rng.ts';

const byId = new Map(cafes.map((c) => [c.id, c]));

// Generous boxes around each city: tight enough to catch a same-name place in
// another province, loose enough that a re-verified address still fits.
const BOX = {
  hp: [20.7, 21.0, 106.5, 106.9],
  hn: [20.9, 21.15, 105.7, 105.95],
  hcm: [10.65, 10.9, 106.55, 106.8],
};

test('every café carries coordinates inside its own city', () => {
  for (const c of cafes) {
    const [south, north, west, east] = BOX[c.city];
    const [lat, lng] = c.coords;
    assert.ok(lat > south && lat < north && lng > west && lng < east, `${c.id} at ${c.coords} is outside ${c.city}`);
  }
  for (const city of Object.keys(BOX)) {
    const n = cafes.filter((c) => c.city === city).length;
    assert.ok(n >= 30, `only ${n} cafés in ${city}`);
  }
});

test('distances are measured from each city centre', () => {
  // Loose bounds, so a re-verified address does not break the test.
  assert.ok(byId.get('muse-coffee').km < 1, 'Muse is a few streets from the Opera House');
  assert.ok(byId.get('harru-quan').km > 4, 'Harru Quán is out in Hải An');
  assert.ok(byId.get('hidden-gem').km < 1.5, 'Hidden Gem is in the Old Quarter');
  assert.ok(byId.get('meo-meo-q1').km < 0.5, 'Méo Meo is beside Bến Thành Market');
  for (const c of cafes) assert.ok(c.km < 20, `${c.id} at ${c.km} km is implausibly far`);
});

test('chains list their branches, each at a distinct address', () => {
  const expected = {
    kafa: 5,
    1986: 4,
    'bac-viet': 5,
    katinat: 7,
    tranquil: 3,
    'little-hanoi': 4,
    'trung-3t': 5,
    'trung-nguyen': 8,
  };
  for (const [brand, count] of Object.entries(expected)) {
    const addresses = cafes.filter((c) => brandOf(c) === brand).map((c) => c.address);
    assert.equal(addresses.length, count, `${brand} branches`);
    assert.equal(new Set(addresses).size, count, `${brand} repeats an address`);
  }
});

test('ids are unique across all cities', () => {
  assert.equal(new Set(cafes.map((c) => c.id)).size, cafes.length);
});

test('Maps metadata looks like Maps', () => {
  for (const c of cafes) {
    assert.ok(c.rating >= 1 && c.rating <= 5 && Number.isInteger(Math.round(c.rating * 10)), `${c.id} rating ${c.rating}`);
    assert.ok(Number.isInteger(c.reviews) && c.reviews > 0, `${c.id} reviews ${c.reviews}`);
    if (c.price !== undefined) assert.ok(priceBand(c.price), `${c.id} has unparseable price ${c.price}`);
  }
});

test('price buckets read as thousands of đồng', () => {
  assert.deepEqual(priceBand('₫1–100,000'), { lo: 0, hi: 100 });
  assert.deepEqual(priceBand('₫1–400,000'), { lo: 0, hi: 400 });
  assert.deepEqual(priceBand('₫100–200K'), { lo: 100, hi: 200 });
  assert.deepEqual(priceBand('₫200K+'), { lo: 200, hi: null });
  assert.equal(priceBand(undefined), null);
  assert.equal(priceBand('cheap'), null);
});

test('the reel picks a brand first, so a seven-branch chain is not seven times as likely', () => {
  const pool = filterCafes(cafes, 'hn', 30, []);
  const brands = new Set(pool.map(brandOf)).size;
  const random = mulberry32(42);
  const draws = 20000;
  let katinat = 0;
  for (let i = 0; i < draws; i++) {
    const pick = pickCafe(pool, random);
    assert.ok(pool.includes(pick));
    if (brandOf(pick) === 'katinat') katinat++;
  }
  // Branch-uniform would give 7 / pool.length, roughly four times this.
  assert.ok(Math.abs(katinat / draws - 1 / brands) < 0.01, `katinat drew ${katinat / draws}, expected ${1 / brands}`);
});

test('only cafés in the chosen city come back', () => {
  for (const city of ['hp', 'hn', 'hcm']) {
    const pool = filterCafes(cafes, city, 30, []);
    assert.ok(pool.length > 0, `${city} is empty`);
    assert.ok(pool.every((c) => c.city === city));
  }
});

test('the radius is inclusive and only ever shrinks the pool', () => {
  for (const city of ['hp', 'hn', 'hcm']) {
    let previous = Infinity;
    for (const radius of [30, 10, 5, 3, 2, 1]) {
      const pool = filterCafes(cafes, city, radius, []);
      assert.ok(pool.length <= previous, `${city} radius ${radius} grew the pool`);
      assert.ok(pool.every((c) => c.km <= radius));
      previous = pool.length;
    }
  }
});

test('vibes match on any selected tag, not on all of them', () => {
  const pool = filterCafes(cafes, 'hcm', 30, ['pet', 'book']);
  assert.ok(pool.some((c) => c.tags.includes('pet')), 'no cat café survived');
  assert.ok(pool.some((c) => c.tags.includes('book')), 'no book café survived');
  assert.ok(pool.every((c) => c.tags.includes('pet') || c.tags.includes('book')));
});

test('untagged cafés get no stray empty tag', () => {
  // ''.split(' ') is [''], which would silently match nothing yet still count
  // as a tag; the loader must turn an empty tag string into an empty list.
  assert.ok(cafes.every((c) => c.tags.every((tag) => tag.length > 0)));
});

test('card art shows the most characterful vibe, with a plain cup as fallback', () => {
  const catCafe = cafes.find((c) => c.tags.includes('pet'));
  assert.equal(cafeEmoji(catCafe), '🐱');
  assert.equal(cafeEmoji({ ...cafes[0], tags: [] }), '☕');
});

test('a chain branch opens its own address in Maps, not the chain list', () => {
  const query = decodeURIComponent(new URL(mapsUrl(byId.get('kafa--ho-sen'))).searchParams.get('query'));
  assert.ok(query.includes('126 P. Hồ Sen'), query);
});
