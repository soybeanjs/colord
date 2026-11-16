import { describe, expect, test } from 'vite-plus/test';
import { clampHsv, hsvToRgb, parseHsv, rgbToHsv, roundHsv } from '../../src/models/hsv';
import { expectRgbClose } from '../helpers';

describe('rgbToHsv', () => {
  test('converts primary colors', () => {
    expect(roundHsv(rgbToHsv({ r: 255, g: 0, b: 0, alpha: 1 }))).toEqual({ h: 0, s: 100, v: 100, alpha: 1 });
    expect(roundHsv(rgbToHsv({ r: 0, g: 255, b: 0, alpha: 1 }))).toEqual({ h: 120, s: 100, v: 100, alpha: 1 });
    expect(roundHsv(rgbToHsv({ r: 0, g: 0, b: 255, alpha: 1 }))).toEqual({ h: 240, s: 100, v: 100, alpha: 1 });
  });

  test('converts black, white and gray', () => {
    expect(roundHsv(rgbToHsv({ r: 0, g: 0, b: 0, alpha: 1 }))).toEqual({ h: 0, s: 0, v: 0, alpha: 1 });
    expect(roundHsv(rgbToHsv({ r: 255, g: 255, b: 255, alpha: 1 }))).toEqual({ h: 0, s: 0, v: 100, alpha: 1 });
    expect(roundHsv(rgbToHsv({ r: 128, g: 128, b: 128, alpha: 1 }))).toEqual({ h: 0, s: 0, v: 50.196, alpha: 1 });
  });
});

describe('hsvToRgb', () => {
  test('converts back to rgb', () => {
    expectRgbClose(hsvToRgb({ h: 0, s: 100, v: 100, alpha: 1 }), { r: 255, g: 0, b: 0 });
    expectRgbClose(hsvToRgb({ h: 120, s: 100, v: 100, alpha: 1 }), { r: 0, g: 255, b: 0 });
    expectRgbClose(hsvToRgb({ h: 240, s: 100, v: 100, alpha: 1 }), { r: 0, g: 0, b: 255 });
    expectRgbClose(hsvToRgb({ h: 0, s: 0, v: 100, alpha: 1 }), { r: 255, g: 255, b: 255 });
  });

  test('is the inverse of rgbToHsv', () => {
    for (const rgb of [
      { r: 52, g: 152, b: 219, alpha: 1 },
      { r: 242, g: 201, b: 76, alpha: 1 },
      { r: 17, g: 34, b: 51, alpha: 1 }
    ]) {
      expectRgbClose(hsvToRgb(rgbToHsv(rgb)), rgb, 2);
    }
  });
});

describe('parseHsv', () => {
  test('parses an object and clamps values', () => {
    expectRgbClose(parseHsv({ h: 0, s: 100, v: 100 })!, { r: 255, g: 0, b: 0 });
    expect(clampHsv({ h: 400, s: 120, v: -1, alpha: 2 })).toEqual({ h: 40, s: 100, v: 0, alpha: 1 });
  });

  test('returns null when a component is missing', () => {
    expect(parseHsv({ h: 0, s: 100 })).toBeNull();
  });
});
