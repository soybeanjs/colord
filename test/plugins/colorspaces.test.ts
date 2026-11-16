import { describe, expect, test } from 'vite-plus/test';
import { cmykPlugin } from '../../src/plugins/cmyk';
import { hwbPlugin } from '../../src/plugins/hwb';
import { labPlugin } from '../../src/plugins/lab';
import { lchPlugin } from '../../src/plugins/lch';
import { oklabPlugin } from '../../src/plugins/oklab';
import { xyzPlugin } from '../../src/plugins/xyz';
import { colord, extend, getFormat } from '../../src';

extend([hwbPlugin, cmykPlugin, labPlugin, lchPlugin, oklabPlugin, xyzPlugin]);

describe('hwb plugin', () => {
  test('adds toHwb and toHwbString', () => {
    const color = colord('#ff0000');

    expect(color.toHwb()).toEqual({ h: 0, w: 0, b: 0, alpha: 1 });
    expect(color.toHwbString()).toBe('hwb(0 0% 0%)');
  });

  test('registers the hwb() parser', () => {
    expect(getFormat('hwb(0 0% 0%)')).toBe('hwb');
    expect(colord('hwb(0 0% 0%)').toHex()).toBe('#ff0000');
  });
});

describe('cmyk plugin', () => {
  test('adds toCmyk and toCmykString', () => {
    const color = colord('#ff0000');

    expect(color.toCmyk()).toEqual({ c: 0, m: 100, y: 100, k: 0, alpha: 1 });
    expect(color.toCmykString()).toBe('device-cmyk(0% 100% 100% 0%)');
  });

  test('registers the device-cmyk() parser', () => {
    expect(getFormat('device-cmyk(0% 100% 100% 0%)')).toBe('cmyk');
    expect(colord('device-cmyk(0% 100% 100% 0%)').toHex()).toBe('#ff0000');
  });
});

describe('lab plugin', () => {
  test('adds toLab and toLabString', () => {
    const color = colord('#ff0000');

    expect(color.toLab().l).toBeCloseTo(54.292, 2);
    expect(color.toLabString()).toBe('lab(54.292% 80.812 69.885)');
  });

  test('registers the lab() parser', () => {
    expect(getFormat('lab(54.292% 80.812 69.885)')).toBe('lab');
    expect(colord('lab(54.292% 80.812 69.885)').toHex()).toBe('#ff0000');
    expect(getFormat({ l: 50, a: 20, b: 30 })).toBe('lab');
  });

  test('delta returns a normalized 0..1 difference', () => {
    expect(colord('#ff0000').delta('#ff0000')).toBe(0);
    expect(colord('#ffffff').delta('#000000')).toBe(1);
    expect(colord('#ff0000').delta('#0000ff')).toBeGreaterThan(0);
    expect(colord('#ff0000').delta('#0000ff')).toBeLessThan(1);
  });
});

describe('lch plugin', () => {
  test('adds toLch and toLchString', () => {
    const color = colord('#ff0000');

    expect(color.toLch().c).toBeCloseTo(106.839, 2);
    expect(color.toLchString()).toBe('lch(54.292% 106.839 40.853)');
  });

  test('registers the lch() parser', () => {
    expect(getFormat('lch(54.292% 106.839 40.853)')).toBe('lch');
    expect(colord('lch(54.292% 106.839 40.853)').toHex()).toBe('#ff0000');
  });
});

describe('oklab plugin', () => {
  test('adds toOklab and toOklabString', () => {
    const color = colord('#ff0000');

    expect(color.toOklab().l).toBeCloseTo(0.628, 3);
    expect(color.toOklabString()).toBe('oklab(62.8% 0.225 0.126)');
  });

  test('registers the oklab() parser', () => {
    expect(getFormat('oklab(62.8% 0.225 0.126)')).toBe('oklab');
    expect(colord('oklab(62.8% 0.225 0.126)').toHex()).toBe('#ff0000');
  });
});

describe('xyz plugin', () => {
  test('adds toXyz', () => {
    const xyz = colord('#ff0000').toXyz();

    expect(xyz.x).toBeCloseTo(0.4124, 3);
    expect(xyz.y).toBeCloseTo(0.2126, 3);
    expect(xyz.z).toBeCloseTo(0.0193, 3);
    expect(xyz.alpha).toBe(1);
  });

  test('registers the xyz object parser', () => {
    expect(getFormat({ x: 0.4124, y: 0.2126, z: 0.0193 })).toBe('xyz');
    expect(colord({ x: 0.4124, y: 0.2126, z: 0.0193 }).toHex()).toBe('#ff0000');
  });
});

describe('extend()', () => {
  test('applies every plugin once', () => {
    extend([hwbPlugin, hwbPlugin]);

    expect(colord('#ff0000').toHwbString()).toBe('hwb(0 0% 0%)');
  });
});
