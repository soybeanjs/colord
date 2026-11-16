import { describe, expect, test } from 'vite-plus/test';
import { a11yPlugin } from '../../src/plugins/a11y';
import { colord, extend } from '../../src';

extend([a11yPlugin]);

describe('luminance()', () => {
  test('is 0 for black and 1 for white', () => {
    expect(colord('#000000').luminance()).toBe(0);
    expect(colord('#ffffff').luminance()).toBe(1);
  });

  test('follows the WCAG relative luminance formula', () => {
    expect(colord('#ff0000').luminance()).toBeCloseTo(0.21, 2);
    expect(colord('#00ff00').luminance()).toBeCloseTo(0.72, 2);
    expect(colord('#0000ff').luminance()).toBeCloseTo(0.07, 2);
  });
});

describe('contrast()', () => {
  test('ranges from 1 to 21', () => {
    expect(colord('#ffffff').contrast('#ffffff')).toBe(1);
    expect(colord('#000000').contrast('#ffffff')).toBe(21);
    expect(colord('#ffffff').contrast('#000000')).toBe(21);
  });

  test('defaults to white as the second color', () => {
    expect(colord('#000000').contrast()).toBe(21);
  });

  test('accepts a Colord instance', () => {
    expect(colord('#000000').contrast(colord('#ffffff'))).toBe(21);
  });
});

describe('isReadable()', () => {
  test('uses AA normal text thresholds by default', () => {
    expect(colord('#000000').isReadable('#ffffff')).toBe(true);
    expect(colord('#777777').isReadable('#ffffff')).toBe(false);
  });

  test('respects the level and size options', () => {
    const color = colord('#777777');

    expect(color.isReadable('#ffffff', { size: 'large' })).toBe(true);
    expect(color.isReadable('#ffffff', { level: 'AAA' })).toBe(false);
  });
});
