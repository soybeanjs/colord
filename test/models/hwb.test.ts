import { describe, expect, test } from 'vite-plus/test';
import { clampHwb, hwbToRgb, parseHwb, parseHwbString, rgbToHwb, rgbToHwbString, roundHwb } from '../../src/models/hwb';
import { expectRgbClose } from '../helpers';

describe('rgbToHwb', () => {
  test('converts pure colors to zero whiteness and blackness', () => {
    expect(roundHwb(rgbToHwb({ r: 255, g: 0, b: 0, alpha: 1 }))).toEqual({ h: 0, w: 0, b: 0, alpha: 1 });
    expect(roundHwb(rgbToHwb({ r: 0, g: 255, b: 0, alpha: 1 }))).toEqual({ h: 120, w: 0, b: 0, alpha: 1 });
  });

  test('converts white and black', () => {
    const white = roundHwb(rgbToHwb({ r: 255, g: 255, b: 255, alpha: 1 }));
    const black = roundHwb(rgbToHwb({ r: 0, g: 0, b: 0, alpha: 1 }));

    expect([white.w, white.b]).toEqual([100, 0]);
    expect([black.w, black.b]).toEqual([0, 100]);
  });

  test('keeps whiteness and blackness summing up to 100 for grays', () => {
    const gray = roundHwb(rgbToHwb({ r: 128, g: 128, b: 128, alpha: 1 }));

    expect(gray.w + gray.b).toBeCloseTo(100, 3);
  });
});

describe('hwbToRgb', () => {
  test('converts back to rgb', () => {
    expectRgbClose(hwbToRgb({ h: 0, w: 0, b: 0, alpha: 1 }), { r: 255, g: 0, b: 0 });
    expectRgbClose(hwbToRgb({ h: 120, w: 0, b: 0, alpha: 1 }), { r: 0, g: 255, b: 0 });
    expectRgbClose(hwbToRgb({ h: 0, w: 100, b: 0, alpha: 1 }), { r: 255, g: 255, b: 255 });
    expectRgbClose(hwbToRgb({ h: 0, w: 0, b: 100, alpha: 1 }), { r: 0, g: 0, b: 0 });
  });

  test('is the inverse of rgbToHwb', () => {
    for (const rgb of [
      { r: 52, g: 152, b: 219, alpha: 1 },
      { r: 242, g: 201, b: 76, alpha: 1 },
      { r: 128, g: 128, b: 128, alpha: 1 }
    ]) {
      expectRgbClose(hwbToRgb(rgbToHwb(rgb)), rgb, 2);
    }
  });
});

describe('parseHwb', () => {
  test('parses an object and clamps values', () => {
    expectRgbClose(parseHwb({ h: 0, w: 0, b: 0 })!, { r: 255, g: 0, b: 0 });
    expect(clampHwb({ h: -10, w: 200, b: -1, alpha: 2 })).toEqual({ h: 350, w: 100, b: 0, alpha: 1 });
  });

  test('returns null when a component is missing', () => {
    expect(parseHwb({ h: 0, w: 0 })).toBeNull();
  });
});

describe('parseHwbString', () => {
  test('parses the hwb() notation', () => {
    expectRgbClose(parseHwbString('hwb(0 0% 0%)')!, { r: 255, g: 0, b: 0 });
    expectRgbClose(parseHwbString('hwb(120 0% 0%)')!, { r: 0, g: 255, b: 0 });
    expectRgbClose(parseHwbString('hwb(0 100% 0%)')!, { r: 255, g: 255, b: 255 });
    expectRgbClose(parseHwbString('hwb(0 0% 0% / 50%)')!, { r: 255, g: 0, b: 0, alpha: 0.5 });
  });

  test('parses hue units', () => {
    expectRgbClose(parseHwbString('hwb(120deg 0% 0%)')!, { r: 0, g: 255, b: 0 });
    expectRgbClose(parseHwbString('hwb(0.5turn 0% 0%)')!, { r: 0, g: 255, b: 255 });
  });

  test('rejects other notations', () => {
    expect(parseHwbString('hwb(0 0 0)')).toBeNull();
    expect(parseHwbString('rgb(255 0 0)')).toBeNull();
  });
});

describe('rgbToHwbString', () => {
  test('formats hwb strings', () => {
    expect(rgbToHwbString({ r: 255, g: 0, b: 0, alpha: 1 })).toBe('hwb(0 0% 0%)');
    expect(rgbToHwbString({ r: 255, g: 0, b: 0, alpha: 0.5 })).toBe('hwb(0 0% 0% / 0.5)');
  });
});
