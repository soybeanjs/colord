import { describe, expect, test } from 'vite-plus/test';
import { colord, Colord } from '../src';
import { expectRgbClose } from './helpers';

describe('colord()', () => {
  test('returns the same instance for a Colord input', () => {
    const instance = colord('#ff0000');

    expect(colord(instance)).toBe(instance);
    expect(instance).toBeInstanceOf(Colord);
  });

  test('parses every supported string notation', () => {
    expect(colord('#f00').toHex()).toBe('#ff0000');
    expect(colord('rgb(255 0 0)').toHex()).toBe('#ff0000');
    expect(colord('hsl(0 100% 50%)').toHex()).toBe('#ff0000');
    expect(colord('oklch(62.8% 0.258 29.234)').toHex()).toBe('#ff0000');
  });
});

describe('to*()', () => {
  const red = colord('#ff0000');

  test('toHex / toRgb / toRgbString', () => {
    expect(red.toHex()).toBe('#ff0000');
    expect(red.toRgb()).toEqual({ r: 255, g: 0, b: 0, alpha: 1 });
    expect(red.toRgbString()).toBe('rgb(255 0 0)');
  });

  test('toHsl / toHslString', () => {
    expect(red.toHsl()).toEqual({ h: 0, s: 100, l: 50, alpha: 1 });
    expect(red.toHslString()).toBe('hsl(0 100% 50%)');
  });

  test('toHsv', () => {
    expect(red.toHsv()).toEqual({ h: 0, s: 100, v: 100, alpha: 1 });
  });

  test('toOklch / toOklchString', () => {
    expect(red.toOklch().l).toBeCloseTo(0.628, 3);
    expect(red.toOklchString()).toBe('oklch(62.8% 0.258 29.234)');
  });

  test('keeps the alpha channel', () => {
    const color = colord('rgba(255, 0, 0, 0.5)');

    expect(color.alpha()).toBe(0.5);
    expect(color.toHex()).toBe('#ff000080');
    expect(color.toRgbString()).toBe('rgb(255 0 0 / 0.5)');
  });
});

describe('source format caching', () => {
  test('returns the original oklch values without conversion loss', () => {
    const color = colord('oklch(50% 0.1 120)');

    expect(color.toOklch()).toEqual({ l: 0.5, c: 0.1, h: 120, alpha: 1 });
    expect(color.toOklchString()).toBe('oklch(50% 0.1 120)');
  });

  test('does not leak the source to other formats', () => {
    expect(colord('oklch(50% 0.1 120)').toHslString()).not.toBe('oklch(50% 0.1 120)');
  });
});

describe('brightness helpers', () => {
  test('brightness is 0..1', () => {
    expect(colord('#000000').brightness()).toBe(0);
    expect(colord('#ffffff').brightness()).toBe(1);
    expect(colord('#808080').brightness()).toBeCloseTo(0.5, 1);
  });

  test('isDark / isLight split at 0.5', () => {
    expect(colord('#000000').isDark()).toBe(true);
    expect(colord('#ffffff').isLight()).toBe(true);
    expect(colord('#000000').isLight()).toBe(false);
  });
});

describe('manipulation', () => {
  test('invert', () => {
    expect(colord('#ffffff').invert().toHex()).toBe('#000000');
    expect(colord('#ff0000').invert().toHex()).toBe('#00ffff');
  });

  test('lighten / darken', () => {
    expect(colord('#ff0000').lighten(0.1).toHslString()).toBe('hsl(0 100% 60%)');
    expect(colord('#ff0000').darken(0.1).toHslString()).toBe('hsl(0 100% 40%)');
    expect(colord('#ff0000').darken(1).toHex()).toBe('#000000');
  });

  test('saturate / desaturate / grayscale', () => {
    // achromatic colors lose their hue, so compare the hsl components instead of the string
    const saturated = colord('#808080').saturate(0.5).toHsl();

    expect(saturated.s).toBe(50);
    expect(saturated.l).toBeCloseTo(50.196, 2);

    const desaturated = colord('#ff0000').desaturate(1).toHsl();

    expect(desaturated.s).toBe(0);
    expect(desaturated.l).toBe(50);

    const gray = colord('#ff0000').grayscale().toHsl();

    expect(gray.s).toBe(0);
    expect(gray.l).toBe(50);
  });

  test('rotate shifts the hue and wraps around', () => {
    expect(colord('#ff0000').rotate(120).toHex()).toBe('#00ff00');
    expect(colord('#ff0000').rotate(240).toHex()).toBe('#0000ff');
    expect(colord('#ff0000').rotate(360).toHex()).toBe('#ff0000');
    expect(colord('#ff0000').rotate(-30).hue()).toBe(330);
  });
});

describe('alpha()', () => {
  test('gets and sets the alpha channel', () => {
    expect(colord('#ff0000').alpha()).toBe(1);
    expect(colord('#ff0000').alpha(0.25).alpha()).toBe(0.25);
    expect(colord('#ff0000').alpha(2).alpha()).toBe(1);
    expect(colord('#ff0000').alpha(-1).alpha()).toBe(0);
  });
});

describe('hue()', () => {
  test('gets and sets the hue', () => {
    expect(colord('#ff0000').hue()).toBe(0);
    expect(colord('#00ff00').hue()).toBe(120);
    expect(colord('#ff0000').hue(120).toHex()).toBe('#00ff00');
  });
});

describe('isEqual()', () => {
  test('compares colors across formats', () => {
    expect(colord('#ff0000').isEqual('rgb(255 0 0)')).toBe(true);
    expect(colord('#ff0000').isEqual(colord('hsl(0 100% 50%)'))).toBe(true);
    expect(colord('#ff0000').isEqual('#0000ff')).toBe(false);
  });

  test('takes the alpha channel into account', () => {
    expect(colord('rgba(255,0,0,0.5)').isEqual('rgba(255,0,0,1)')).toBe(false);
  });
});

describe('immutability', () => {
  test('manipulation returns new instances', () => {
    const color = colord('#ff0000');

    expect(color.lighten(0.2)).not.toBe(color);
    expectRgbClose(color.toRgb(), { r: 255, g: 0, b: 0 });
  });
});
