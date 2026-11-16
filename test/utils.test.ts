import { describe, expect, test } from 'vite-plus/test';
import {
  clamp,
  clampHue,
  floor,
  isPresent,
  mul3x3,
  parseAlpha,
  parseHue,
  parseValueToDecimal,
  round
} from '../src/utils';

describe('isPresent', () => {
  test('accepts non-empty strings and any number', () => {
    expect(isPresent('a')).toBe(true);
    expect(isPresent(0)).toBe(true);
    expect(isPresent(-1)).toBe(true);
  });

  test('rejects empty strings, null, undefined, objects', () => {
    expect(isPresent('')).toBe(false);
    expect(isPresent(null)).toBe(false);
    expect(isPresent(undefined)).toBe(false);
    expect(isPresent({})).toBe(false);
  });
});

describe('round', () => {
  test('rounds to the given precision', () => {
    expect(round(1.2345, 2)).toBe(1.23);
    expect(round(1.2355, 2)).toBe(1.24);
    expect(round(2.5)).toBe(3);
  });

  test('never returns negative zero', () => {
    expect(Object.is(round(-0.4), 0)).toBe(true);
  });
});

describe('floor', () => {
  test('floors to the given precision', () => {
    expect(floor(1.239, 2)).toBe(1.23);
    expect(floor(-1.239, 2)).toBe(-1.24);
  });
});

describe('clamp', () => {
  test('defaults to the 0..1 range', () => {
    expect(clamp(1.5)).toBe(1);
    expect(clamp(-1)).toBe(0);
    expect(clamp(0.5)).toBe(0.5);
  });

  test('accepts a custom range', () => {
    expect(clamp(300, 0, 255)).toBe(255);
    expect(clamp(-20, -10, 10)).toBe(-10);
  });
});

describe('clampHue', () => {
  test('wraps degrees into the 1..360 range', () => {
    expect(clampHue(-1)).toBe(359);
    expect(clampHue(361)).toBe(1);
    expect(clampHue(720)).toBe(360);
  });

  test('turns zero and non-finite values into 360', () => {
    expect(clampHue(0)).toBe(360);
    expect(clampHue(Number.POSITIVE_INFINITY)).toBe(360);
    expect(clampHue(Number.NaN)).toBe(360);
  });
});

describe('parseHue', () => {
  test('converts angle units to degrees', () => {
    expect(parseHue('120')).toBe(120);
    expect(parseHue('120', 'deg')).toBe(120);
    expect(parseHue('1', 'turn')).toBe(360);
    expect(parseHue('100', 'grad')).toBe(90);
    expect(parseHue('3.141592653589793', 'rad')).toBeCloseTo(180, 6);
  });

  test('falls back to degrees for unknown units', () => {
    expect(parseHue('45', 'foo')).toBe(45);
  });
});

describe('parseAlpha', () => {
  test('defaults to 1', () => {
    expect(parseAlpha(undefined)).toBe(1);
    expect(parseAlpha('')).toBe(1);
  });

  test('parses numbers and percentages', () => {
    expect(parseAlpha('0.5')).toBe(0.5);
    expect(parseAlpha('50%')).toBe(0.5);
    expect(parseAlpha('0')).toBe(0);
    expect(parseAlpha('100%')).toBe(1);
  });
});

describe('parseValueToDecimal', () => {
  test('reads percentages as a fraction', () => {
    expect(parseValueToDecimal('100%')).toBe(1);
    expect(parseValueToDecimal('50%')).toBe(0.5);
    expect(parseValueToDecimal('1%')).toBe(0.01);
  });

  test('keeps numbers in the 0..1 range as they are', () => {
    expect(parseValueToDecimal('0')).toBe(0);
    expect(parseValueToDecimal('0.5')).toBe(0.5);
    expect(parseValueToDecimal('1')).toBe(1);
  });

  test('treats numbers above 1 as percentages for backwards compatibility', () => {
    expect(parseValueToDecimal('62.8')).toBeCloseTo(0.628, 6);
    expect(parseValueToDecimal('150')).toBe(1);
  });
});

describe('mul3x3', () => {
  test('multiplies a 3x3 matrix by a vector', () => {
    const identity: [[number, number, number], [number, number, number], [number, number, number]] = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ];

    expect(mul3x3(identity, [1, 2, 3])).toEqual([1, 2, 3]);
    expect(
      mul3x3(
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9]
        ],
        [1, 1, 1]
      )
    ).toEqual([6, 15, 24]);
  });
});
