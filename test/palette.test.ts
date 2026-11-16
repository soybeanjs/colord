import { describe, expect, test } from 'vite-plus/test';
import {
  generateNearestPalette,
  generatePalette,
  paletteColorLevels,
  parseTailwindColor,
  tailwindChromaticPaletteKeys,
  tailwindNeutralPaletteKeys,
  tailwindPalette,
  tailwindPaletteKeys
} from '../src/palette';

describe('palette constants', () => {
  test('expose the eleven color levels', () => {
    expect(paletteColorLevels).toHaveLength(11);
    expect(paletteColorLevels[0]).toBe(50);
    expect(paletteColorLevels.at(-1)).toBe(950);
  });

  test('every palette has every level', () => {
    for (const key of tailwindPaletteKeys) {
      expect(Object.keys(tailwindPalette[key])).toHaveLength(paletteColorLevels.length);
    }
  });

  test('neutral and chromatic keys do not overlap and cover all keys', () => {
    const neutral = new Set<string>(tailwindNeutralPaletteKeys);
    const chromatic = tailwindChromaticPaletteKeys.filter(key => !neutral.has(key));

    expect([...neutral].filter(key => !tailwindPaletteKeys.includes(key as never))).toEqual([]);
    expect(neutral.size + chromatic.length).toBe(tailwindPaletteKeys.length);
  });
});

describe('generatePalette()', () => {
  test('returns every level for the requested format', () => {
    const palette = generatePalette('#3498db', 'hex');

    expect(Object.keys(palette)).toHaveLength(paletteColorLevels.length);
    for (const level of paletteColorLevels) {
      expect(palette[level]).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  test('keeps the input color as level 500', () => {
    expect(generatePalette('#3498db', 'hex')[500]).toBe('#3498db');
  });

  test('is ordered from light to dark', () => {
    const palette = generatePalette('#3498db', 'oklch');
    const lightness = paletteColorLevels.map(level => palette[level].l);

    expect([...lightness].sort((a, b) => b - a)).toEqual(lightness);
    expect(lightness[0]).toBeGreaterThan(0.9);
    expect(lightness.at(-1)).toBeLessThan(0.4);
  });

  test('works for very light and very dark base colors', () => {
    for (const input of ['#ffffff', '#000000', '#ffff00']) {
      const palette = generatePalette(input, 'oklch');
      const lightness = paletteColorLevels.map(level => palette[level].l);

      expect(lightness.every(l => l >= 0 && l <= 1)).toBe(true);
      expect([...lightness].sort((a, b) => b - a)).toEqual(lightness);
    }
  });

  test('supports every output format', () => {
    expect(typeof generatePalette('#3498db', 'oklchString')[500]).toBe('string');
    expect(typeof generatePalette('#3498db', 'rgbString')[500]).toBe('string');
    expect(typeof generatePalette('#3498db', 'rgb')[500]).toBe('object');
    expect(typeof generatePalette('#3498db', 'hsl')[500]).toBe('object');
    expect(typeof generatePalette('#3498db', 'hslString')[500]).toBe('string');
  });

  test('carries the alpha channel', () => {
    const palette = generatePalette('rgba(52,152,219,0.5)', 'rgb');

    expect(palette[50].alpha).toBe(0.5);
    expect(palette[950].alpha).toBe(0.5);
  });

  test('throws on an invalid color', () => {
    expect(() => generatePalette('nope')).toThrow('Invalid color value');
  });
});

describe('generateNearestPalette()', () => {
  test('finds the exact palette color', () => {
    const nearest = generateNearestPalette('#64748b', 'hex');

    expect(nearest.paletteKey).toBe('slate');
    // the level comes from an object key, so it is a string
    expect(nearest.level).toBe('500' as never);
    expect(nearest.color).toBe('#64748b');
    expect(nearest.delta).toBe(0);
  });

  test('returns the closest palette color for an arbitrary input', () => {
    const nearest = generateNearestPalette('#ff0000');

    expect(nearest.delta).toBeGreaterThan(0);
    expect(Object.keys(nearest.palette)).toHaveLength(paletteColorLevels.length);
    expect(nearest.color).toEqual(nearest.palette[nearest.level]);
  });

  test('starts the result from the parsed input color', () => {
    const nearest = generateNearestPalette('#ff0000', 'hex');

    expect(nearest.current).toBe('#ff0000');
  });
});

describe('parseTailwindColor()', () => {
  test('parses a palette key into the requested format', () => {
    expect(parseTailwindColor('slate.500', 'hex')).toBe('#64748b');
    expect(parseTailwindColor('slate.500', 'oklchString')).toBe('oklch(55% 0.04 257)');
    expect(parseTailwindColor('slate.500').l).toBeCloseTo(0.55, 2);
  });

  test('throws on unknown palette or level', () => {
    expect(() => parseTailwindColor('nope.500' as never)).toThrow('Invalid tailwind palette key: nope');
    expect(() => parseTailwindColor('slate.1000' as never)).toThrow('Invalid tailwind palette level: 1000');
  });
});
