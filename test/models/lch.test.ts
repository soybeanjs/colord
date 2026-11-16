import { describe, expect, test } from 'vite-plus/test';
import {
  clampLch,
  lchaToRgb,
  parseLch,
  parseLchBySource,
  parseLchString,
  rgbToLch,
  rgbToLchString,
  roundLch,
  toLchString,
  toLchStringBySource
} from '../../src/models/lch';
import { expectRgbWithin } from '../helpers';

describe('rgbToLch', () => {
  test('converts sRGB red to the CSS Color 4 reference values', () => {
    const red = roundLch(rgbToLch({ r: 255, g: 0, b: 0, alpha: 1 }));

    expect(red.l).toBeCloseTo(54.292, 2);
    expect(red.c).toBeCloseTo(106.839, 2);
    expect(red.h).toBeCloseTo(40.853, 2);
  });

  test('converts achromatic colors to zero chroma', () => {
    const gray = roundLch(rgbToLch({ r: 128, g: 128, b: 128, alpha: 1 }));

    expect(gray.c).toBe(0);
    expect(gray.l).toBeCloseTo(53.585, 2);
  });
});

describe('lchaToRgb', () => {
  test('is the inverse of rgbToLch', () => {
    for (const rgb of [
      { r: 255, g: 0, b: 0, alpha: 1 },
      { r: 52, g: 152, b: 219, alpha: 1 },
      { r: 242, g: 201, b: 76, alpha: 0.5 }
    ]) {
      expectRgbWithin(lchaToRgb(rgbToLch(rgb)), rgb);
    }
  });
});

describe('clampLch', () => {
  test('clamps lightness, chroma, hue and alpha', () => {
    expect(clampLch({ l: 120, c: 200, h: -30, alpha: 2 })).toEqual({ l: 100, c: 150, h: 330, alpha: 1 });
  });
});

describe('parseLch', () => {
  test('parses an object', () => {
    expectRgbWithin(parseLch({ l: 54.292, c: 106.839, h: 40.853 })!, { r: 255, g: 0, b: 0, alpha: 1 });
  });

  test('returns null when a component is missing', () => {
    expect(parseLch({ l: 50, c: 10 })).toBeNull();
  });
});

describe('parseLchString', () => {
  test('parses the lch() notation', () => {
    expectRgbWithin(parseLchString('lch(54.292% 106.839 40.853)')!, { r: 255, g: 0, b: 0, alpha: 1 });
    expectRgbWithin(parseLchString('lch(54.292 106.839 40.853deg)')!, { r: 255, g: 0, b: 0, alpha: 1 });
  });

  test('parses alpha', () => {
    expect(parseLchString('lch(54.292% 106.839 40.853 / 0.5)')!.alpha).toBe(0.5);
  });

  test('rejects other notations', () => {
    expect(parseLchString('lab(54.292% 80.812 69.885)')).toBeNull();
  });
});

describe('lch strings', () => {
  test('formats lch strings', () => {
    expect(toLchString({ l: 54.2923, c: 106.8392, h: 40.8526, alpha: 1 })).toBe('lch(54.292% 106.839 40.853)');
    expect(rgbToLchString({ r: 255, g: 0, b: 0, alpha: 1 })).toBe('lch(54.292% 106.839 40.853)');
  });
});

describe('source caching', () => {
  const source = { format: 'lch', input: 'lch(50% 20 30)' } as const;

  test('reads lch values from the original input', () => {
    expect(parseLchBySource(source)).toEqual({ l: 50, c: 20, h: 30, alpha: 1 });
    expect(toLchStringBySource(source)).toBe('lch(50% 20 30)');
  });

  test('ignores a source with another format', () => {
    expect(parseLchBySource({ format: 'rgb', input: 'rgb(255 0 0)' })).toBeNull();
    expect(toLchStringBySource(undefined)).toBeNull();
  });
});
