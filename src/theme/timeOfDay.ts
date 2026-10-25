import { blendColor, daylight } from '../features/grandstands/scene/daylight.ts';

// Textos e superfícies trocam juntos; a iluminação da cena continua gradual.
export function timeOfDayTheme(minutes: number) {
  const { night } = daylight(minutes);
  const dark = night >= .5;
  const progress = dark ? (night - .5) * 2 : night * 2;
  const background = dark
    ? blendColor('#252a34', '#171c26', progress)
    : blendColor('#f5f5f7', '#f3e7df', progress);
  const surface = dark
    ? blendColor('#303642', '#242c38', progress)
    : blendColor('#ffffff', '#fff9f3', progress);
  const text = dark ? '#f2f3f6' : '#353139';
  const muted = dark ? '#c6cbd4' : '#5b5360';
  const accent = dark ? '#f1bac9' : '#793947';
  return {
    background, surface, text, muted, accent,
    border: dark ? '#5d6676' : '#d8c9ce',
    soft: dark ? '#353e4d' : '#f2e8ec',
    red: dark ? '#ff929b' : '#c81e1e',
    green: dark ? '#78dfa5' : '#15803d',
    redSurface: dark ? '#392d37' : '#fff1f2',
    greenSurface: dark ? '#273a35' : '#f0fdf4',
    accentInk: dark ? '#242c38' : '#ffffff',
    scheme: dark ? 'dark' : 'light',
  } as const;
}
