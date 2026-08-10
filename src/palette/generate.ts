import { keysOf } from '../shared';
import { colord } from '../colord';
import type { AnyColor } from '../types';
import type { OutputColorMap, OutputFormat, PaletteColorItem, PaletteColorLevel } from './types';

const paletteScales: Record<PaletteColorLevel, { l: number; c: number }> = {
  50: { l: 0.08, c: 0.065 },
  100: { l: 0.18, c: 0.15 },
  200: { l: 0.313, c: 0.276 },
  300: { l: 0.507, c: 0.491 },
  400: { l: 0.777, c: 0.771 },
  500: { l: 1.0, c: 1.0 },
  600: { l: 0.876, c: 1.145 },
  700: { l: 0.783, c: 1.136 },
  800: { l: 0.681, c: 0.93 },
  900: { l: 0.608, c: 0.682 },
  950: { l: 0.453, c: 0.425 }
};

/**
 * generate the palette
 *
 * the input color is treated as the main color (level 500), and the other levels are
 * derived relative to it:
 * - the light colors (50-400) increase the lightness, so they are always lighter than 500
 * - the dark colors (600-950) decrease the lightness, so they are always darker than 500
 *
 * because the lightness is always derived relative to the base lightness, the resulting
 * palette is monotonically ordered for any input color (light steps, then 500, then dark
 * steps), including extreme light or dark base colors.
 *
 * @param input - the base color
 * @param [format] - the format of the output color, default is 'oklch'
 * @returns the palette
 */
export function generatePalette<F extends OutputFormat = 'oklch'>(input: AnyColor, format: F = 'oklch' as F) {
  const baseColor = colord(input);

  if (!baseColor.isValid()) {
    throw new Error('Invalid color value');
  }

  const { l: baseL, c: baseC, h: baseH, alpha } = baseColor.toOklch();

  const palette = {} as Record<PaletteColorLevel, OutputColorMap[F]>;

  keysOf(paletteScales).forEach($level => {
    const level = Number($level) as PaletteColorLevel;
    const scale = paletteScales[level];

    let l = baseL;
    let c = baseC;
    let h = baseH;

    if (level < 500) {
      // the light colors (50-400): increase the lightness and decrease the chroma
      l = 1 - (1 - baseL) * scale.l;

      // the hue shift for the light colors
      const hueShift = getLightHueShift(baseH, scale.l);
      h = (baseH + hueShift + 360) % 360;
    }

    if (level > 500) {
      // the dark colors (600-950): decrease the lightness and increase the chroma
      l = baseL * scale.l;

      // use the adaptive strategy for the hue shift
      const hueShift = getDarkHueShift(baseH, scale.l);
      h = (baseH + hueShift + 360) % 360;
    }

    c = Math.max(0, baseC * scale.c);

    const oklch = {
      l,
      c,
      h,
      alpha
    };

    palette[level] = formatOutput(oklch, format);
  });

  return palette;
}

/**
 * calculate the hue shift for the light colors
 * the light colors usually shift to the cold色调 (hue decrease)
 */
function getLightHueShift(h500: number, lightnessScale: number): number {
  // the shift amount is proportional to the lightness change
  const baseShift = (1 - lightnessScale) * 8;

  // the shift direction is different for different hue ranges
  if ((h500 >= 0 && h500 < 60) || h500 >= 330) {
    // red: shift to the cold色调 (decrease)
    return -baseShift;
  } else if (h500 >= 60 && h500 < 150) {
    // yellow-green: shift to the warm color tone (increase)
    return baseShift;
  } else if (h500 >= 150 && h500 < 210) {
    // green-cyan: shift to the warm color tone (increase)
    return baseShift * 0.7;
  } else if (h500 >= 210 && h500 < 270) {
    // blue: shift to the cold color tone (decrease)
    return -baseShift;
  }
  // purple: shift to the warm color tone (increase)
  return baseShift * 0.5;
}

/**
 * calculate the hue shift for the dark colors
 * the dark colors usually shift to the warm color tone (hue increase)
 */
function getDarkHueShift(h500: number, lightnessScale: number): number {
  // the shift amount is proportional to the lightness decrease
  const baseShift = (1 - lightnessScale) * 10;

  // the shift direction is different for different hue ranges
  if ((h500 >= 0 && h500 < 60) || h500 >= 330) {
    // red: shift to the warm color tone (increase)
    return baseShift * 0.3;
  } else if (h500 >= 60 && h500 < 150) {
    // yellow-green: shift to the cold color tone (decrease) - Yellow special treatment
    return -baseShift;
  } else if (h500 >= 150 && h500 < 210) {
    // green-cyan: shift to the warm color tone (increase)
    return baseShift * 0.3;
  } else if (h500 >= 210 && h500 < 270) {
    // blue: shift to the warm color tone (increase)
    return baseShift * 0.6;
  }
  // purple: shift to the cold color tone (decrease)
  return -baseShift * 0.2;
}

export function formatOutput<F extends OutputFormat>(input: AnyColor, format: F = 'oklch' as F) {
  const color = colord(input);

  let value: unknown = input;

  if (format === 'hex') {
    value = color.toHex();
  } else if (format === 'rgb') {
    value = color.toRgb();
  } else if (format === 'rgbString') {
    value = color.toRgbString();
  } else if (format === 'oklch') {
    value = color.toOklch();
  } else if (format === 'oklchString') {
    value = color.toOklchString();
  } else if (format === 'hsl') {
    value = color.toHsl();
  } else if (format === 'hslString') {
    value = color.toHslString();
  }

  return value as OutputColorMap[F];
}

export function getPaletteColorByFormat<F extends OutputFormat>(item: PaletteColorItem, format: F = 'oklch' as F) {
  const map = {
    hex: 'hex',
    rgb: 'rgb',
    rgbString: 'rgb',
    oklch: 'oklch',
    oklchString: 'oklch',
    hsl: 'hsl',
    hslString: 'hsl'
  } as Record<OutputFormat, Exclude<keyof PaletteColorItem, 'level'>>;

  const colorValue = item[map[format]];

  return formatOutput(colorValue, format);
}
