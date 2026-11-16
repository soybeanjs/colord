import { describe, expect, test } from 'vite-plus/test';
import {
  clampCmyk,
  cmykToRgb,
  parseCmyk,
  parseCmykString,
  rgbToCmyk,
  rgbToCmykString,
  roundCmyk
} from '../../src/models/cmyk';
import { expectRgbClose, expectRgbWithin } from '../helpers';

describe('rgbToCmyk', () => {
  test('converts primary colors', () => {
    expect(roundCmyk(rgbToCmyk({ r: 255, g: 0, b: 0, alpha: 1 }))).toEqual({ c: 0, m: 100, y: 100, k: 0, alpha: 1 });
    expect(roundCmyk(rgbToCmyk({ r: 0, g: 0, b: 255, alpha: 1 }))).toEqual({ c: 100, m: 100, y: 0, k: 0, alpha: 1 });
  });

  test('converts black and white', () => {
    expect(roundCmyk(rgbToCmyk({ r: 0, g: 0, b: 0, alpha: 1 }))).toEqual({ c: 0, m: 0, y: 0, k: 100, alpha: 1 });
    expect(roundCmyk(rgbToCmyk({ r: 255, g: 255, b: 255, alpha: 1 }))).toEqual({ c: 0, m: 0, y: 0, k: 0, alpha: 1 });
  });
});

describe('cmykToRgb', () => {
  test('converts back to rgb', () => {
    expectRgbClose(cmykToRgb({ c: 0, m: 100, y: 100, k: 0, alpha: 1 }), { r: 255, g: 0, b: 0 });
    expectRgbClose(cmykToRgb({ c: 0, m: 0, y: 0, k: 100, alpha: 1 }), { r: 0, g: 0, b: 0 });
  });

  test('is the inverse of rgbToCmyk', () => {
    // rgbToCmyk rounds the percentages to integers, so a 1/255 step of precision is expected
    for (const rgb of [
      { r: 52, g: 152, b: 219, alpha: 1 },
      { r: 242, g: 201, b: 76, alpha: 1 }
    ]) {
      expectRgbWithin(cmykToRgb(rgbToCmyk(rgb)), rgb);
    }
  });
});

describe('parseCmyk', () => {
  test('parses an object and clamps values', () => {
    expectRgbClose(parseCmyk({ c: 0, m: 100, y: 100, k: 0 })!, { r: 255, g: 0, b: 0 });
    expect(clampCmyk({ c: 200, m: -1, y: 50, k: 500, alpha: 2 })).toEqual({ c: 100, m: 0, y: 50, k: 100, alpha: 1 });
  });

  test('returns null when a component is missing', () => {
    expect(parseCmyk({ c: 0, m: 0, y: 0 })).toBeNull();
  });
});

describe('parseCmykString', () => {
  test('parses percentages', () => {
    expectRgbClose(parseCmykString('device-cmyk(0% 100% 100% 0%)')!, { r: 255, g: 0, b: 0 });
    expectRgbClose(parseCmykString('device-cmyk(0%, 100%, 100%, 0%)')!, { r: 255, g: 0, b: 0 });
  });

  test('scales unitless numbers as fractions', () => {
    expectRgbClose(parseCmykString('device-cmyk(0 1 1 0)')!, { r: 255, g: 0, b: 0 });
  });

  test('parses alpha', () => {
    expectRgbClose(parseCmykString('device-cmyk(0% 100% 100% 0% / 50%)')!, { r: 255, g: 0, b: 0, alpha: 0.5 });
  });

  test('rejects other notations', () => {
    expect(parseCmykString('cmyk(0 100 100 0)')).toBeNull();
  });
});

describe('rgbToCmykString', () => {
  test('formats cmyk strings', () => {
    expect(rgbToCmykString({ r: 255, g: 0, b: 0, alpha: 1 })).toBe('device-cmyk(0% 100% 100% 0%)');
    expect(rgbToCmykString({ r: 255, g: 0, b: 0, alpha: 0.5 })).toBe('device-cmyk(0% 100% 100% 0% / 0.5)');
  });
});
