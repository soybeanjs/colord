import { describe, expect, test } from 'vite-plus/test';
import { colord, getFormat } from '../src';

describe('getFormat', () => {
  test('detects string notations', () => {
    expect(getFormat('#fff')).toBe('hex');
    expect(getFormat('#ffffff80')).toBe('hex');
    expect(getFormat('rgb(255 0 0)')).toBe('rgb');
    expect(getFormat('hsl(0 100% 50%)')).toBe('hsl');
    expect(getFormat('oklch(62.8% 0.258 29.234)')).toBe('oklch');
  });

  test('detects object notations', () => {
    expect(getFormat({ r: 255, g: 0, b: 0 })).toBe('rgb');
    expect(getFormat({ h: 0, s: 100, l: 50 })).toBe('hsl');
    expect(getFormat({ h: 0, s: 100, v: 100 })).toBe('hsv');
    expect(getFormat({ l: 0.6, c: 0.25, h: 30 })).toBe('oklch');
  });

  test('returns undefined for unknown input', () => {
    expect(getFormat('not-a-color')).toBeUndefined();
    expect(getFormat('')).toBeUndefined();
    expect(getFormat('#ff')).toBeUndefined();
    expect(getFormat({ foo: 'bar' })).toBeUndefined();
  });
});

describe('parse', () => {
  test('trims whitespace around string inputs', () => {
    expect(colord('  #fff  ').toHex()).toBe('#ffffff');
  });

  test('parsers are tried in order', () => {
    // an hsl object is not a valid rgb object and vice versa
    expect(colord({ h: 0, s: 100, v: 100 }).toHex()).toBe('#ff0000');
    expect(colord({ h: 0, s: 100, l: 50 }).toHex()).toBe('#ff0000');
  });

  test('falls back to opaque black for invalid input', () => {
    for (const input of ['', 'nonsense', '#ff', {}, null, undefined, 42] as const) {
      const instance = colord(input as never);

      expect(instance.isValid()).toBe(false);
      expect(instance.toRgb()).toEqual({ r: 0, g: 0, b: 0, alpha: 1 });
    }
  });
});
