import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cafes, filterCafes, cafeEmoji, mapsUrl } from '../src/lib/cafes.ts';

const hp = cafes.filter((c) => c.city === 'hp');

test('every Hải Phòng café carries coordinates inside the city', () => {
  // The whole point of the Maps pass: no Hải Phòng entry may fall back to a
  // district guess, and none may be a same-name place in another province.
  for (const c of hp) {
    assert.ok(c.coords, `${c.id} has no coordinates`);
    const [lat, lng] = c.coords;
    assert.ok(lat > 20.7 && lat < 21.0 && lng > 106.5 && lng < 106.9, `${c.id} at ${c.coords} is not in Hải Phòng`);
  }
  assert.ok(hp.length >= 30, `only ${hp.length} Hải Phòng cafés`);
});

test('distances are measured from the Opera House', () => {
  const byId = new Map(cafes.map((c) => [c.id, c]));
  // Muse Coffee sits a few streets from the Opera House; Harru Quán is out in
  // Hải An. Loose bounds, so a re-verified address does not break the test.
  assert.ok(byId.get('muse-coffee').km < 1, `Muse is ${byId.get('muse-coffee').km} km`);
  assert.ok(byId.get('harru-quan').km > 4, `Harru is ${byId.get('harru-quan').km} km`);
  for (const c of hp) assert.ok(c.km < 20, `${c.id} at ${c.km} km is implausibly far`);
});

test('chains list their branches, each at a distinct address', () => {
  const branches = (name) => hp.filter((c) => c.name.toLowerCase().includes(name));
  assert.equal(branches('kafa').length, 5);
  assert.equal(branches('1986').length, 4);
  assert.ok(branches('bắc việt').length >= 5);
  for (const name of ['kafa', '1986', 'bắc việt']) {
    const addresses = branches(name).map((c) => c.address);
    assert.equal(new Set(addresses).size, addresses.length, `${name} repeats an address`);
  }
});

test('ids are unique across all cities', () => {
  assert.equal(new Set(cafes.map((c) => c.id)).size, cafes.length);
});

test('only cafés in the chosen city come back', () => {
  for (const city of ['hp', 'hn', 'hcm']) {
    const pool = filterCafes(cafes, city, 30, []);
    assert.ok(pool.length > 0, `${city} is empty`);
    assert.ok(pool.every((c) => c.city === city));
  }
});

test('the radius is inclusive and only ever shrinks the pool', () => {
  let previous = Infinity;
  for (const radius of [30, 10, 5, 3, 2, 1]) {
    const pool = filterCafes(cafes, 'hp', radius, []);
    assert.ok(pool.length <= previous, `radius ${radius} grew the pool`);
    assert.ok(pool.every((c) => c.km <= radius));
    previous = pool.length;
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
  const branch = cafes.find((c) => c.id === 'kafa-ho-sen');
  const query = decodeURIComponent(new URL(mapsUrl(branch)).searchParams.get('query'));
  assert.ok(query.includes('126 P. Hồ Sen'), query);
  const unverified = cafes.find((c) => c.city === 'hn');
  const fallback = decodeURIComponent(new URL(mapsUrl(unverified)).searchParams.get('query'));
  assert.ok(!fallback.includes(unverified.address), 'unverified cafés should search by name and city only');
});
