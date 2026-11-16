import { describe, expect, test } from 'vite-plus/test';
import {
  clampOklch,
  oklchToRgb,
  parseOklch,
  parseOklchBySource,
  parseOklchString,
  rgbToOklch,
  rgbToOklchString,
  roundOklch,
  toOklchString,
  toOklchStringBySource
} from '../../src/models/oklch';
import { expectRgbWithin } from '../helpers';

describe('rgbToOklch', () => {
  test('converts sRGB primaries to the reference values', () => {
    const red = roundOklch(rgbToOklch({ r: 255, g: 0, b: 0, alpha: 1 }));

    expect(red.l).toBeCloseTo(0.628, 3);
    expect(red.c).toBeCloseTo(0.258, 3);
    expect(red.h).toBeCloseTo(29.234, 2);
  });

  test('converts achromatic colors to zero chroma', () => {
    const white = roundOklch(rgbToOklch({ r: 255, g: 255, b: 255, alpha: 1 }));
    const gray = roundOklch(rgbToOklch({ r: 128, g: 128, b: 128, alpha: 1 }));

    expect(white.l).toBe(1);
    expect(white.c).toBe(0);
    expect(gray.l).toBeCloseTo(0.6, 3);
    expect(gray.c).toBe(0);
  });
});

describe('oklchToRgb', () => {
  test('is the inverse of rgbToOklch', () => {
    for (const rgb of [
      { r: 255, g: 0, b: 0, alpha: 1 },
      { r: 52, g: 152, b: 219, alpha: 1 },
      { r: 242, g: 201, b: 76, alpha: 0.5 }
    ]) {
      expectRgbWithin(oklchToRgb(rgbToOklch(rgb)), rgb);
    }
  });
});

describe('clampOklch', () => {
  test('clamps lightness to 0..1, chroma to 0..0.37, hue and alpha', () => {
    expect(clampOklch({ l: 2, c: 1, h: -30, alpha: 2 })).toEqual({ l: 1, c: 0.37, h: 330, alpha: 1 });
  });
});

describe('parseOklch', () => {
  test('parses an object', () => {
    expectRgbWithin(parseOklch({ l: 0.6279, c: 0.2577, h: 29.23 })!, { r: 255, g: 0, b: 0, alpha: 1 });
  });

  test('returns null when a component is missing', () => {
    expect(parseOklch({ l: 0.5, c: 0.1 })).toBeNull();
  });
});

describe('parseOklchString', () => {
  test('parses percentage and unitless lightness', () => {
    expectRgbWithin(parseOklchString('oklch(62.79% 0.2577 29.23)')!, { r: 255, g: 0, b: 0, alpha: 1 });
    expectRgbWithin(parseOklchString('oklch(0.6279 0.2577 29.23)')!, { r: 255, g: 0, b: 0, alpha: 1 });
  });

  test('keeps a small percentage lightness small', () => {
    const nearBlack = parseOklchString('oklch(1% 0 0)')!;
    const white = parseOklchString('oklch(100% 0 0)')!;

    expect(nearBlack.r).toBeLessThan(10);
    expect(nearBlack.alpha).toBe(1);
    expect(white.r).toBeCloseTo(255, 3);
  });

  test('parses hue units and alpha', () => {
    expectRgbWithin(parseOklchString('oklch(62.79% 0.2577 0.0812turn)')!, { r: 255, g: 0, b: 0, alpha: 1 });
    expect(parseOklchString('oklch(62.79% 0.2577 29.23 / 50%)')!.alpha).toBe(0.5);
  });

  test('rejects other notations', () => {
    expect(parseOklchString('oklab(62.79% 0.2249 0.1258)')).toBeNull();
  });
});

describe('oklch strings', () => {
  test('formats oklch strings with a percentage lightness', () => {
    expect(toOklchString({ l: 0.6279, c: 0.2577, h: 29.2338, alpha: 1 })).toBe('oklch(62.8% 0.258 29.234)');
    expect(toOklchString({ l: 0.6279, c: 0.2577, h: 29.2338, alpha: 0.5 })).toBe('oklch(62.8% 0.258 29.234 / 0.5)');
    expect(rgbToOklchString({ r: 255, g: 0, b: 0, alpha: 1 })).toBe('oklch(62.8% 0.258 29.234)');
  });
});

describe('source caching', () => {
  const source = { format: 'oklch', input: 'oklch(50% 0.1 120)' } as const;

  test('reads oklch values from the original input', () => {
    expect(parseOklchBySource(source)).toEqual({ l: 0.5, c: 0.1, h: 120, alpha: 1 });
    expect(toOklchStringBySource(source)).toBe('oklch(50% 0.1 120)');
  });

  test('ignores a source with another format', () => {
    expect(parseOklchBySource({ format: 'rgb', input: 'rgb(255 0 0)' })).toBeNull();
    expect(toOklchStringBySource(undefined)).toBeNull();
  });
});
