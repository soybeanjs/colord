import { describe, expect, test } from 'vite-plus/test';
import {
  clampLinearRgb,
  clampRgb,
  linearRgbToRgb,
  linearToRgb,
  parseLinearRgb,
  parseRgb,
  parseRgbString,
  rgbToLinear,
  rgbToLinearRgb,
  rgbToRgbString,
  roundRgb
} from '../../src/models/rgb';
import { expectRgbClose } from '../helpers';

describe('clampRgb', () => {
  test('clamps channels to 0..255 and alpha to 0..1', () => {
    expect(clampRgb({ r: 300, g: -10, b: 128, alpha: 2 })).toEqual({ r: 255, g: 0, b: 128, alpha: 1 });
  });
});

describe('roundRgb', () => {
  test('rounds channels to 2 decimals and alpha to 3', () => {
    expect(roundRgb({ r: 1.2345, g: 2.5, b: 3.0009, alpha: 0.12345 })).toEqual({
      r: 1.23,
      g: 2.5,
      b: 3,
      alpha: 0.123
    });
  });
});

describe('parseRgb', () => {
  test('parses an object with numbers', () => {
    expect(parseRgb({ r: 255, g: 0, b: 0 })).toEqual({ r: 255, g: 0, b: 0, alpha: 1 });
    expect(parseRgb({ r: 255, g: 0, b: 0, alpha: 0.5 })).toEqual({ r: 255, g: 0, b: 0, alpha: 0.5 });
  });

  test('accepts numeric strings and clamps out of range values', () => {
    expect(parseRgb({ r: '10', g: '400', b: '-5' })).toEqual({ r: 10, g: 255, b: 0, alpha: 1 });
  });

  test('returns null when a channel is missing', () => {
    expect(parseRgb({ r: 255, g: 0 })).toBeNull();
    expect(parseRgb({})).toBeNull();
  });
});

describe('parseRgbString', () => {
  test('parses comma and space separated syntax', () => {
    expect(parseRgbString('rgb(255,0,0)')).toEqual({ r: 255, g: 0, b: 0, alpha: 1 });
    expect(parseRgbString('rgb(255 0 0)')).toEqual({ r: 255, g: 0, b: 0, alpha: 1 });
    expect(parseRgbString('rgba(255, 0, 0, 0.5)')).toEqual({ r: 255, g: 0, b: 0, alpha: 0.5 });
    expect(parseRgbString('rgb(255 0 0 / 50%)')).toEqual({ r: 255, g: 0, b: 0, alpha: 0.5 });
  });

  test('parses percentages', () => {
    expect(parseRgbString('rgb(100%, 0%, 0%)')).toEqual({ r: 255, g: 0, b: 0, alpha: 1 });
    expect(parseRgbString('rgb(50% 50% 50%)')).toEqual({ r: 128, g: 128, b: 128, alpha: 1 });
  });

  test('rejects other notations', () => {
    expect(parseRgbString('#ff0000')).toBeNull();
    expect(parseRgbString('hsl(0 100% 50%)')).toBeNull();
    expect(parseRgbString('rgb(255 0)')).toBeNull();
  });
});

describe('rgbToRgbString', () => {
  test('uses the modern space separated syntax', () => {
    expect(rgbToRgbString({ r: 255, g: 0, b: 0, alpha: 1 })).toBe('rgb(255 0 0)');
    expect(rgbToRgbString({ r: 255, g: 0, b: 0, alpha: 0.5 })).toBe('rgb(255 0 0 / 0.5)');
  });

  test('rounds the channels', () => {
    expect(rgbToRgbString({ r: 1.4, g: 2.6, b: 3, alpha: 1 })).toBe('rgb(1.4 2.6 3)');
  });
});

describe('linear rgb conversion', () => {
  test('rgbToLinear maps 0 and 255 to 0 and 1', () => {
    expect(rgbToLinear(0)).toBe(0);
    expect(rgbToLinear(255)).toBeCloseTo(1, 10);
  });

  test('uses the linear segment for very dark values', () => {
    expect(rgbToLinear(10)).toBeCloseTo(10 / 255 / 12.92, 10);
  });

  test('linearToRgb is the inverse of rgbToLinear', () => {
    for (const value of [0, 1, 10, 127, 200, 255]) {
      expect(linearToRgb(rgbToLinear(value))).toBeCloseTo(value, 8);
    }
  });

  test('rgbToLinearRgb keeps the alpha channel', () => {
    const linear = rgbToLinearRgb({ r: 255, g: 255, b: 255, alpha: 0.4 });

    expectRgbClose(linear, { r: 1, g: 1, b: 1, alpha: 0.4 });
  });

  test('linearRgbToRgb is the inverse of rgbToLinearRgb', () => {
    const source = { r: 52, g: 152, b: 219, alpha: 0.7 };

    expectRgbClose(linearRgbToRgb(rgbToLinearRgb(source)), source, 3);
  });

  test('clampLinearRgb clamps to the 0..1 range', () => {
    expect(clampLinearRgb({ r: 1.2, g: -0.1, b: 0.5, alpha: 1 })).toEqual({ r: 1, g: 0, b: 0.5, alpha: 1 });
  });

  test('parseLinearRgb clamps and returns a linear color', () => {
    expect(parseLinearRgb({ r: 2, g: -1, b: 0.25 })).toEqual({ r: 1, g: 0, b: 0.25, alpha: 1 });
    expect(parseLinearRgb({ r: 1 })).toBeNull();
  });
});
