import type { CSSProperties } from 'react';
import { timeOfDayTheme } from './timeOfDay';

type ColorPalette = Omit<ReturnType<typeof timeOfDayTheme>, 'scheme'>;

export function paletteForTime(minutes: number) {
  const { scheme, ...palette } = timeOfDayTheme(minutes);
  return { palette, scheme };
}

export function paletteVariables(palette: ColorPalette): CSSProperties {
  return Object.fromEntries(Object.entries(palette).map(([key, value]) => [`--theme-${key}`, value])) as CSSProperties;
}
