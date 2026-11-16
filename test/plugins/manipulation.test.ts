import { describe, expect, test } from 'vite-plus/test';
import { harmoniesPlugin } from '../../src/plugins/harmonies';
import { minifyPlugin } from '../../src/plugins/minify';
import { mixPlugin } from '../../src/plugins/mix';
import { namesPlugin } from '../../src/plugins/names';
import { colord, extend } from '../../src';

extend([mixPlugin, harmoniesPlugin, minifyPlugin, namesPlugin]);

describe('mix()', () => {
  test('returns the source color at ratio 0 and the target color at ratio 1', () => {
    expect(colord('#ff0000').mix('#0000ff', 0).toHex()).toBe('#ff0000');
    expect(colord('#ff0000').mix('#0000ff', 1).toHex()).toBe('#0000ff');
  });

  test('mixes in lab space', () => {
    const mixed = colord('#ff0000').mix('#0000ff');

    expect(mixed.isValid()).toBe(true);
    expect(mixed.toHex()).not.toBe('#ff0000');
    expect(mixed.toHex()).not.toBe('#0000ff');
  });

  test('averages the alpha channel', () => {
    expect(colord('rgba(255,0,0,1)').mix('rgba(0,0,255,0)').alpha()).toBe(0.5);
  });

  test('accepts a Colord instance', () => {
    expect(colord('#ff0000').mix(colord('#0000ff'), 0).toHex()).toBe('#ff0000');
  });
});

describe('tints / shades / tones', () => {
  test('generate 5 colors by default', () => {
    expect(colord('#ff0000').tints()).toHaveLength(5);
    expect(colord('#ff0000').shades()).toHaveLength(5);
    expect(colord('#ff0000').tones()).toHaveLength(5);
  });

  test('respect the requested count', () => {
    expect(colord('#ff0000').tints(3)).toHaveLength(3);
    expect(colord('#ff0000').shades(1)).toHaveLength(1);
  });

  test('start from the source color and end with the target', () => {
    const tints = colord('#ff0000').tints(3);

    expect(tints[0].toHex()).toBe('#ff0000');
    expect(tints[2].toHex()).toBe('#ffffff');
  });
});

describe('harmonies()', () => {
  test('defaults to complementary colors', () => {
    const harmonies = colord('#ff0000').harmonies();

    expect(harmonies).toHaveLength(2);
    expect(harmonies[0].toHex()).toBe('#ff0000');
    expect(harmonies[1].hue()).toBe(180);
  });

  test('supports every harmony type', () => {
    const types = [
      ['analogous', 3],
      ['complementary', 2],
      ['double-split-complementary', 5],
      ['rectangle', 4],
      ['split-complementary', 3],
      ['tetradic', 4],
      ['triadic', 3]
    ] as const;

    for (const [type, length] of types) {
      expect(colord('#ff0000').harmonies(type)).toHaveLength(length);
    }
  });
});

describe('minify()', () => {
  test('picks the shortest representation', () => {
    expect(colord('#ff0000').minify()).toBe('#f00');
    expect(colord('#aabbcc').minify()).toBe('#abc');
    expect(colord('#123456').minify()).toBe('#123456');
  });

  test('honours the options', () => {
    expect(colord('#ff0000').minify({ hex: false })).toBe('rgb(255,0,0)');
    expect(colord('#ff0000').minify({ hex: false, rgb: false })).toBe('hsl(0,100%,50%)');
  });

  test('uses color names when available', () => {
    expect(colord('#ff0000').minify({ name: true })).toBe('red');
  });

  test('can output the transparent keyword', () => {
    expect(colord('rgba(0,0,0,0)').minify({ transparent: true })).toBe('transparent');
  });

  test('keeps the alpha channel', () => {
    expect(colord('rgba(255,0,0,0.5)').minify({ alphaHex: true })).toBe('#ff000080');
  });
});

describe('names plugin', () => {
  test('parses css color names', () => {
    expect(colord('red').toHex()).toBe('#ff0000');
    expect(colord('ReBeCcApUrPlE').toHex()).toBe('#663399');
    expect(colord('transparent').toRgb()).toEqual({ r: 0, g: 0, b: 0, alpha: 0 });
  });

  test('toName returns the exact match', () => {
    expect(colord('#ff0000').toName()).toBe('red');
    expect(colord('#663399').toName()).toBe('rebeccapurple');
  });

  test('toName returns undefined without an exact match', () => {
    expect(colord('#fefefe').toName()).toBeUndefined();
  });

  test('toName finds the closest name when asked', () => {
    expect(colord('#fefefe').toName({ closest: true })).toBe('white');
  });

  test('toName returns transparent for a fully transparent color', () => {
    expect(colord('rgba(0,0,0,0)').toName()).toBe('transparent');
  });
});
