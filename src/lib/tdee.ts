import type { Body } from './storage';

// Kept apart from storage.ts on purpose: this module has no runtime imports,
// so the Node test runner can load it directly. storage.ts imports './dishes'
// without an extension, which Vite resolves and plain Node ESM does not.

/**
 * Mifflin-St Jeor resting rate scaled by an activity factor — the formula
 * most clinical calculators use. It is a population average: real needs vary
 * with body composition, health and medication, so the UI presents the number
 * as a starting point rather than a prescription.
 */
export function tdee(body: Body): number {
  const bmr = 10 * body.weight + 6.25 * body.height - 5 * body.age + (body.sex === 'm' ? 5 : -161);
  return Math.round(bmr * body.activity);
}
