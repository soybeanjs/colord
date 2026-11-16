import { describe, expect, test } from 'vite-plus/test';
import {
  clampOklab,
  oklabToRgb,
  parseOklab,
  parseOklabBySource,
  parseOklabString,
  rgbToOklab,
  rgbToOklabString,
  roundOklab,
  toOklabString,
  toOklabStringBySource
} from '../../src/models/oklab';
import { expectRgbWithin } from '../helpers';

describe('rgbToOklab', () => {
  test('converts sRGB primaries to the reference values', () => {
    const red = roundOklab(rgbToOklab({ r: 255, g: 0, b: 0, alpha: 1 }));

    expect(red.l).toBeCloseTo(0.628, 3);
    expect(red.a).toBeCloseTo(0.225, 3);
    expect(red.b).toBeCloseTo(0.126, 3);
    expect(red.alpha).toBe(1);
  });

  test('converts white and black', () => {
    expect(roundOklab(rgbToOklab({ r: 255, g: 255, b: 255, alpha: 1 }))).toEqual({ l: 1, a: 0, b: 0, alpha: 1 });
    expect(roundOklab(rgbToOklab({ r: 0, g: 0, b: 0, alpha: 1 }))).toEqual({ l: 0, a: 0, b: 0, alpha: 1 });
  });

  test('converts gray to a neutral color', () => {
    const gray = roundOklab(rgbToOklab({ r: 128, g: 128, b: 128, alpha: 1 }));

    expect(gray.l).toBeCloseTo(0.6, 3);
    expect(gray.a).toBe(0);
    expect(gray.b).toBe(0);
  });
});

describe('oklabToRgb', () => {
  test('is the inverse of rgbToOklab', () => {
    for (const rgb of [
      { r: 255, g: 0, b: 0, alpha: 1 },
      { r: 52, g: 152, b: 219, alpha: 1 },
      { r: 242, g: 201, b: 76, alpha: 0.5 }
    ]) {
      expectRgbWithin(oklabToRgb(rgbToOklab(rgb)), rgb);
    }
  });
});

describe('clampOklab', () => {
  test('clamps lightness to 0..1, a/b to +-0.4 and alpha to 0..1', () => {
    expect(clampOklab({ l: 2, a: -1, b: 1, alpha: 2 })).toEqual({ l: 1, a: -0.4, b: 0.4, alpha: 1 });
  });
});

describe('parseOklab', () => {
  test('parses an object', () => {
    expectRgbWithin(parseOklab({ l: 0.6279, a: 0.2249, b: 0.1258 })!, { r: 255, g: 0, b: 0, alpha: 1 });
  });

  test('returns null when a component is missing', () => {
    expect(parseOklab({ l: 0.5, a: 0.1 })).toBeNull();
  });
});

describe('parseOklabString', () => {
  test('parses percentage and unitless lightness', () => {
    expectRgbWithin(parseOklabString('oklab(62.79% 0.2249 0.1258)')!, { r: 255, g: 0, b: 0, alpha: 1 });
    expectRgbWithin(parseOklabString('oklab(0.6279 0.2249 0.1258)')!, { r: 255, g: 0, b: 0, alpha: 1 });
  });

  test('keeps a small percentage lightness small', () => {
    const [min, max] = [parseOklabString('oklab(1% 0 0)')!, parseOklabString('oklab(100% 0 0)')!];

    expect(min.r).toBeLessThan(10);
    expect(max.r).toBeCloseTo(255, 3);
  });

  test('parses alpha', () => {
    expect(parseOklabString('oklab(62.79% 0.2249 0.1258 / 50%)')!.alpha).toBe(0.5);
  });

  test('rejects other notations', () => {
    expect(parseOklabString('oklch(62.79% 0.2577 29.23)')).toBeNull();
  });
});

describe('oklab strings', () => {
  test('formats oklab strings with a percentage lightness', () => {
    expect(toOklabString({ l: 0.6279, a: 0.2249, b: 0.1258, alpha: 1 })).toBe('oklab(62.8% 0.225 0.126)');
    expect(toOklabString({ l: 0.6279, a: 0.2249, b: 0.1258, alpha: 0.5 })).toBe('oklab(62.8% 0.225 0.126 / 0.5)');
    expect(toOklabString({ l: 1, a: 0, b: 0, alpha: 1 })).toBe('oklab(100% 0 0)');
    expect(rgbToOklabString({ r: 255, g: 0, b: 0, alpha: 1 })).toBe('oklab(62.8% 0.225 0.126)');
  });
});

describe('source caching', () => {
  const source = { format: 'oklab', input: 'oklab(50% 0.1 -0.1)' } as const;

  test('reads oklab values from the original input', () => {
    expect(parseOklabBySource(source)).toEqual({ l: 0.5, a: 0.1, b: -0.1, alpha: 1 });
    expect(toOklabStringBySource(source)).toBe('oklab(50% 0.1 -0.1)');
  });

  test('ignores a source with another format', () => {
    expect(parseOklabBySource({ format: 'rgb', input: 'rgb(255 0 0)' })).toBeNull();
    expect(toOklabStringBySource(undefined)).toBeNull();
  });
});
