import { expect } from 'vite-plus/test';
import type { RgbColor } from '../src';

/** Asserts an RGB value matches the expected one, tolerating conversion noise. */
export const expectRgbClose = (actual: RgbColor, expected: Partial<RgbColor>, digits = 0): void => {
  expect(actual.r).toBeCloseTo(expected.r ?? 0, digits);
  expect(actual.g).toBeCloseTo(expected.g ?? 0, digits);
  expect(actual.b).toBeCloseTo(expected.b ?? 0, digits);
  expect(actual.alpha).toBeCloseTo(expected.alpha ?? 1, 3);
};

/** Asserts every RGB channel stays within `tolerance` of the expected one. */
export const expectRgbWithin = (actual: RgbColor, expected: RgbColor, tolerance = 1): void => {
  expect(Math.abs(actual.r - expected.r)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(actual.g - expected.g)).toBeLessThanOrEqual(tolerance);
  expect(Math.abs(actual.b - expected.b)).toBeLessThanOrEqual(tolerance);
  expect(actual.alpha).toBeCloseTo(expected.alpha, 3);
};
