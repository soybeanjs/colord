import { describe, expect, test } from 'vite-plus/test';
import {
  clampLab,
  labToRgb,
  parseLab,
  parseLabBySource,
  parseLabString,
  rgbToLab,
  rgbToLabString,
  roundLab,
  toLabString,
  toLabStringBySource
} from '../../src/models/lab';
import { expectRgbWithin } from '../helpers';

describe('rgbToLab', () => {
  test('converts sRGB primaries to the CSS Color 4 reference values', () => {
    const red = roundLab(rgbToLab({ r: 255, g: 0, b: 0, alpha: 1 }));

    expect(red.l).toBeCloseTo(54.292, 2);
    expect(red.a).toBeCloseTo(80.812, 2);
    expect(red.b).toBeCloseTo(69.885, 2);
    expect(red.alpha).toBe(1);
  });

  test('converts achromatic colors to zero a and b', () => {
    const white = roundLab(rgbToLab({ r: 255, g: 255, b: 255, alpha: 1 }));
    const black = roundLab(rgbToLab({ r: 0, g: 0, b: 0, alpha: 1 }));

    expect(white).toEqual({ l: 100, a: 0, b: 0, alpha: 1 });
    expect(black).toEqual({ l: 0, a: 0, b: 0, alpha: 1 });
  });
});

describe('labToRgb', () => {
  test('is the inverse of rgbToLab', () => {
    for (const rgb of [
      { r: 255, g: 0, b: 0, alpha: 1 },
      { r: 52, g: 152, b: 219, alpha: 0.4 },
      { r: 242, g: 201, b: 76, alpha: 1 }
    ]) {
      expectRgbWithin(labToRgb(rgbToLab(rgb)), rgb);
    }
  });

  test('clamps out of gamut results', () => {
    const rgb = labToRgb({ l: 100, a: 160, b: -160, alpha: 1 });

    expect(rgb.r).toBeGreaterThanOrEqual(0);
    expect(rgb.r).toBeLessThanOrEqual(255);
    expect(rgb.g).toBeGreaterThanOrEqual(0);
    expect(rgb.b).toBeLessThanOrEqual(255);
  });
});

describe('clampLab', () => {
  test('clamps lightness to 0..100, a/b to +-160 and alpha to 0..1', () => {
    expect(clampLab({ l: 120, a: -200, b: 200, alpha: 2 })).toEqual({ l: 100, a: -160, b: 160, alpha: 1 });
  });
});

describe('parseLab', () => {
  test('parses an object', () => {
    expectRgbWithin(parseLab({ l: 54.292, a: 80.812, b: 69.885 })!, { r: 255, g: 0, b: 0, alpha: 1 });
  });

  test('returns null when a component is missing', () => {
    expect(parseLab({ l: 50, a: 10 })).toBeNull();
  });
});

describe('parseLabString', () => {
  test('parses the lab() notation', () => {
    expectRgbWithin(parseLabString('lab(54.292% 80.812 69.885)')!, { r: 255, g: 0, b: 0, alpha: 1 });
    expectRgbWithin(parseLabString('lab(54.292 80.812 69.885)')!, { r: 255, g: 0, b: 0, alpha: 1 });
  });

  test('parses alpha', () => {
    expect(parseLabString('lab(54.292% 80.812 69.885 / 50%)')!.alpha).toBe(0.5);
  });

  test('rejects other notations', () => {
    expect(parseLabString('lch(54.292% 106.839 40.853)')).toBeNull();
    expect(parseLabString('lab(54.292, 80.812, 69.885)')).toBeNull();
  });
});

describe('lab strings', () => {
  test('formats lab strings with a percentage lightness', () => {
    expect(toLabString({ l: 54.2923, a: 80.8118, b: 69.8846, alpha: 1 })).toBe('lab(54.292% 80.812 69.885)');
    expect(toLabString({ l: 54.2923, a: 80.8118, b: 69.8846, alpha: 0.5 })).toBe('lab(54.292% 80.812 69.885 / 0.5)');
    expect(rgbToLabString({ r: 255, g: 0, b: 0, alpha: 1 })).toBe('lab(54.292% 80.812 69.885)');
  });
});

describe('source caching', () => {
  const source = { format: 'lab', input: 'lab(50% 20 30 / 0.5)' } as const;

  test('reads lab values from the original input', () => {
    expect(parseLabBySource(source)).toEqual({ l: 50, a: 20, b: 30, alpha: 0.5 });
    expect(toLabStringBySource(source)).toBe('lab(50% 20 30 / 0.5)');
  });

  test('ignores a source with another format', () => {
    expect(parseLabBySource({ format: 'rgb', input: 'rgb(255 0 0)' })).toBeNull();
    expect(parseLabBySource(undefined)).toBeNull();
    expect(toLabStringBySource(undefined)).toBeNull();
  });
});
