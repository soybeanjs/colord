import { describe, expect, test } from 'vite-plus/test';
import { parseHex, rgbToHex } from '../../src/models/hex';

describe('parseHex', () => {
  test('parses 3, 4, 6 and 8 digit hex strings', () => {
    expect(parseHex('#fff')).toEqual({ r: 255, g: 255, b: 255, alpha: 1 });
    expect(parseHex('#f00')).toEqual({ r: 255, g: 0, b: 0, alpha: 1 });
    expect(parseHex('#ffffff')).toEqual({ r: 255, g: 255, b: 255, alpha: 1 });
    expect(parseHex('#ff000080')).toEqual({ r: 255, g: 0, b: 0, alpha: 0.5 });
    expect(parseHex('#fff8')).toEqual({ r: 255, g: 255, b: 255, alpha: 0.53 });
  });

  test('is case insensitive', () => {
    expect(parseHex('#FF0000')).toEqual(parseHex('#ff0000'));
    expect(parseHex('#ABCDEF')).toEqual(parseHex('#abcdef'));
  });

  test('treats a fully opaque alpha as 1', () => {
    expect(parseHex('#ffff')).toEqual({ r: 255, g: 255, b: 255, alpha: 1 });
    expect(parseHex('#000000ff')).toEqual({ r: 0, g: 0, b: 0, alpha: 1 });
  });

  test('rejects malformed input', () => {
    expect(parseHex('fff')).toBeNull();
    expect(parseHex('#ff')).toBeNull();
    expect(parseHex('#fffff')).toBeNull();
    expect(parseHex('#ggg')).toBeNull();
    expect(parseHex('')).toBeNull();
  });
});

describe('rgbToHex', () => {
  test('omits the alpha channel when it is 1', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0, alpha: 1 })).toBe('#ff0000');
    expect(rgbToHex({ r: 0, g: 0, b: 0, alpha: 1 })).toBe('#000000');
  });

  test('appends the alpha channel when it is less than 1', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0, alpha: 0.5 })).toBe('#ff000080');
    expect(rgbToHex({ r: 0, g: 0, b: 0, alpha: 0 })).toBe('#00000000');
  });

  test('rounds and pads each channel', () => {
    expect(rgbToHex({ r: 1.4, g: 2.6, b: 15.5, alpha: 1 })).toBe('#010310');
  });
});
