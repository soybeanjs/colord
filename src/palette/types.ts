import type { HslColor, OklchColor, RgbColor } from '../types';

/**
 * the palette color level
 *
 * the main color level is 500
 */
export type PaletteColorLevel = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;

/**
 * the tailwind palette key
 */
export type TailwindPaletteKey =
  | 'slate'
  | 'mist'
  | 'gray'
  | 'zinc'
  | 'neutral'
  | 'stone'
  | 'taupe'
  | 'olive'
  | 'mauve'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose';

/**
 * the tailwind neutral palette key
 *
 * the neutral palette is used for the neutral colors, which are usually used for the background and border colors
 */
export type TailwindNeutralPaletteKey = Extract<
  TailwindPaletteKey,
  'slate' | 'mist' | 'gray' | 'zinc' | 'neutral' | 'stone' | 'taupe' | 'olive' | 'mauve'
>;

/**
 * the tailwind color palette level key
 *
 * the color palette level key is used for the color palette level, which is usually used for the color classes
 */
export type TailwindPaletteLevelColorKey = `${TailwindPaletteKey}.${PaletteColorLevel}`;

/**
 * the palette color item
 */
export interface PaletteColorItem {
  level: PaletteColorLevel;
  hex: string;
  rgb: string;
  hsl: string;
  oklch: string;
}

/**
 * the tailwind palette
 *
 * the color format is `oklch` string
 */
export type TailwindPalette = {
  [K in TailwindPaletteKey]: {
    [L in PaletteColorLevel]: PaletteColorItem;
  };
};

export type SimplePaletteKey = 'inherit' | 'current' | 'transparent' | 'black' | 'white';

export type SimplePalette = Record<SimplePaletteKey, string | Omit<PaletteColorItem, 'level'>>;

export type OutputColorMap = {
  hex: string;
  rgb: RgbColor;
  rgbString: string;
  oklch: OklchColor;
  oklchString: string;
  hsl: HslColor;
  hslString: string;
};

export type OutputFormat = keyof OutputColorMap;

export interface NearestPalette<F extends OutputFormat> {
  /** current color */
  current: OutputColorMap[F];
  /** palette color key */
  paletteKey: TailwindPaletteKey;
  /** palette level */
  level: PaletteColorLevel;
  /** palette color */
  color: OutputColorMap[F];
  /** the color delta value */
  delta: number;
  /** palette colors */
  palette: Record<PaletteColorLevel, OutputColorMap[F]>;
}
