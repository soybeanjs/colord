import { describe, expect, test } from 'vite-plus/test';
import {
  clampHsl,
  hslToHsv,
  hslToRgb,
  hsvToHsl,
  parseHsl,
  parseHslString,
  rgbToHsl,
  rgbToHslString,
  roundHsl
} from '../../src/models/hsl';
import { expectRgbClose } from '../helpers';

describe('rgbToHsl', () => {
  test('converts primary colors', () => {
    expect(roundHsl(rgbToHsl({ r: 255, g: 0, b: 0, alpha: 1 }))).toEqual({ h: 0, s: 100, l: 50, alpha: 1 });
    expect(roundHsl(rgbToHsl({ r: 0, g: 255, b: 0, alpha: 1 }))).toEqual({ h: 120, s: 100, l: 50, alpha: 1 });
    expect(roundHsl(rgbToHsl({ r: 0, g: 0, b: 255, alpha: 1 }))).toEqual({ h: 240, s: 100, l: 50, alpha: 1 });
  });

  test('converts achromatic colors to zero saturation', () => {
    const white = roundHsl(rgbToHsl({ r: 255, g: 255, b: 255, alpha: 1 }));
    const black = roundHsl(rgbToHsl({ r: 0, g: 0, b: 0, alpha: 1 }));

    expect([white.s, white.l, white.alpha]).toEqual([0, 100, 1]);
    expect([black.s, black.l, black.alpha]).toEqual([0, 0, 1]);
  });

  test('keeps the alpha channel', () => {
    expect(rgbToHsl({ r: 255, g: 0, b: 0, alpha: 0.25 }).alpha).toBe(0.25);
  });
});

describe('hslToRgb', () => {
  test('converts back to rgb', () => {
    expectRgbClose(hslToRgb({ h: 0, s: 100, l: 50, alpha: 1 }), { r: 255, g: 0, b: 0 });
    expectRgbClose(hslToRgb({ h: 120, s: 100, l: 50, alpha: 1 }), { r: 0, g: 255, b: 0 });
    expectRgbClose(hslToRgb({ h: 240, s: 100, l: 50, alpha: 1 }), { r: 0, g: 0, b: 255 });
    expectRgbClose(hslToRgb({ h: 0, s: 0, l: 100, alpha: 1 }), { r: 255, g: 255, b: 255 });
    expectRgbClose(hslToRgb({ h: 0, s: 0, l: 0, alpha: 1 }), { r: 0, g: 0, b: 0 });
  });

  test('is the inverse of rgbToHsl', () => {
    for (const rgb of [
      { r: 52, g: 152, b: 219, alpha: 1 },
      { r: 242, g: 201, b: 76, alpha: 1 },
      { r: 17, g: 34, b: 51, alpha: 1 }
    ]) {
      expectRgbClose(hslToRgb(rgbToHsl(rgb)), rgb, 2);
    }
  });
});

describe('hsl <-> hsv', () => {
  test('converts both ways', () => {
    const hsl = { h: 204, s: 70, l: 53, alpha: 1 };
    const roundTrip = hsvToHsl(hslToHsv(hsl));

    expect(roundTrip.h).toBeCloseTo(hsl.h, 6);
    expect(roundTrip.s).toBeCloseTo(hsl.s, 6);
    expect(roundTrip.l).toBeCloseTo(hsl.l, 6);
    expect(roundTrip.alpha).toBe(hsl.alpha);
  });
});

describe('parseHsl', () => {
  test('parses an object', () => {
    expectRgbClose(parseHsl({ h: 0, s: 100, l: 50 })!, { r: 255, g: 0, b: 0 });
    expectRgbClose(parseHsl({ h: 0, s: 100, l: 50, alpha: 0.5 })!, { r: 255, g: 0, b: 0, alpha: 0.5 });
  });

  test('clamps out of range values', () => {
    expect(clampHsl({ h: -1, s: 200, l: -20, alpha: 5 })).toEqual({ h: 359, s: 100, l: 0, alpha: 1 });
  });

  test('returns null when a component is missing', () => {
    expect(parseHsl({ h: 0, s: 100 })).toBeNull();
  });
});

describe('parseHslString', () => {
  test('parses comma and space separated syntax', () => {
    expectRgbClose(parseHslString('hsl(0, 100%, 50%)')!, { r: 255, g: 0, b: 0 });
    expectRgbClose(parseHslString('hsl(0 100% 50%)')!, { r: 255, g: 0, b: 0 });
    expectRgbClose(parseHslString('hsla(0, 100%, 50%, 0.5)')!, { r: 255, g: 0, b: 0, alpha: 0.5 });
    expectRgbClose(parseHslString('hsl(0 100% 50% / 50%)')!, { r: 255, g: 0, b: 0, alpha: 0.5 });
  });

  test('parses hue units', () => {
    expectRgbClose(parseHslString('hsl(120deg 100% 50%)')!, { r: 0, g: 255, b: 0 });
    expectRgbClose(parseHslString('hsl(0.5turn 100% 50%)')!, { r: 0, g: 255, b: 255 });
  });

  test('rejects rgb notation', () => {
    expect(parseHslString('rgb(255 0 0)')).toBeNull();
    expect(parseHslString('hsl(0 100 50)')).toBeNull();
  });
});

describe('rgbToHslString', () => {
  test('formats hsl strings', () => {
    expect(rgbToHslString({ r: 255, g: 0, b: 0, alpha: 1 })).toBe('hsl(0 100% 50%)');
    expect(rgbToHslString({ r: 255, g: 0, b: 0, alpha: 0.5 })).toBe('hsl(0 100% 50% / 0.5)');
    expect(rgbToHslString({ r: 52, g: 152, b: 219, alpha: 1 })).toBe('hsl(204.072 69.874% 53.137%)');
  });
});
