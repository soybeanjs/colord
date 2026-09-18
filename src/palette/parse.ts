import { tailwindPalette } from './constant';
import { getPaletteColorByFormat } from './generate';
import type {
  OutputColorMap,
  OutputFormat,
  PaletteColorLevel,
  TailwindPaletteKey,
  TailwindPaletteLevelColorKey
} from './types';

/**
 * parse the tailwind color key to the real color value
 *
 * @example
 * ```ts
 * parseTailwindColor('slate.500'); // { l: 0.55, c: 0.04, h: 257, alpha: 1 }
 * parseTailwindColor('slate.500', 'hex'); // '#64748b'
 * parseTailwindColor('slate.500', 'oklchString'); // 'oklch(55% 0.04 257)'
 * ```
 *
 * @param key - the tailwind palette level color key, like `slate.500`
 * @param format - the format of the output color, default is 'oklch'
 * @returns the color value in the given format
 */
export function parseTailwindColor<F extends OutputFormat = 'oklch'>(
  key: TailwindPaletteLevelColorKey,
  format: F = 'oklch' as F
): OutputColorMap[F] {
  const [paletteKey, levelKey] = (key as string).split('.') as [TailwindPaletteKey, `${PaletteColorLevel}`];

  const palette = tailwindPalette[paletteKey];

  if (!palette) {
    throw new Error(`Invalid tailwind palette key: ${paletteKey}`);
  }

  const level = Number(levelKey) as PaletteColorLevel;
  const item = palette[level];

  if (!item) {
    throw new Error(`Invalid tailwind palette level: ${levelKey}`);
  }

  return getPaletteColorByFormat(item, format);
}
