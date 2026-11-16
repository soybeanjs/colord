import { describe, expect, test } from 'vite-plus/test';
import { D65 } from '../../src/constants';
import { clampXyz, parseOriginXyz, parseXyz, rgbToXyz, roundXyz, xyzToRgb } from '../../src/models/xyz';
import { expectRgbWithin } from '../helpers';

describe('rgbToXyz', () => {
  test('converts white to the D65 white point', () => {
    const white = roundXyz(rgbToXyz({ r: 255, g: 255, b: 255, alpha: 1 }));

    expect(white.x).toBeCloseTo(0.9505, 3);
    expect(white.y).toBeCloseTo(1, 3);
    expect(white.z).toBeCloseTo(1.089, 3);
  });

  test('converts sRGB red', () => {
    const red = roundXyz(rgbToXyz({ r: 255, g: 0, b: 0, alpha: 1 }));

    expect(red.x).toBeCloseTo(0.4124, 3);
    expect(red.y).toBeCloseTo(0.2126, 3);
    expect(red.z).toBeCloseTo(0.0193, 3);
  });

  test('converts black to zero', () => {
    expect(roundXyz(rgbToXyz({ r: 0, g: 0, b: 0, alpha: 1 }))).toEqual({ x: 0, y: 0, z: 0, alpha: 1 });
  });
});

describe('xyzToRgb', () => {
  test('is the inverse of rgbToXyz', () => {
    for (const rgb of [
      { r: 255, g: 0, b: 0, alpha: 1 },
      { r: 52, g: 152, b: 219, alpha: 1 },
      { r: 0, g: 0, b: 0, alpha: 1 }
    ]) {
      expectRgbWithin(xyzToRgb(rgbToXyz(rgb)), rgb);
    }
  });
});

describe('clampXyz', () => {
  test('clamps axes to 1.2x the D65 white point and alpha to 0..1', () => {
    const clamped = clampXyz({ x: -1, y: 5, z: 5, alpha: 2 });

    expect(clamped.x).toBe(0);
    expect(clamped.y).toBeCloseTo(D65.y * 1.2, 6);
    expect(clamped.z).toBeCloseTo(D65.z * 1.2, 6);
    expect(clamped.alpha).toBe(1);
  });
});

describe('parseXyz', () => {
  test('parses an xyz object into rgb', () => {
    expectRgbWithin(parseXyz({ x: 0.4124, y: 0.2126, z: 0.0193 })!, { r: 255, g: 0, b: 0, alpha: 1 });
  });

  test('returns null when a component is missing', () => {
    expect(parseXyz({ x: 0.4, y: 0.2 })).toBeNull();
  });

  test('parseOriginXyz keeps the values untouched (except clamping)', () => {
    expect(parseOriginXyz({ x: 0.4, y: 0.2, z: 0.1, alpha: 0.5 })).toEqual({ x: 0.4, y: 0.2, z: 0.1, alpha: 0.5 });
    expect(parseOriginXyz({ x: 0.4 })).toBeNull();
  });
});
