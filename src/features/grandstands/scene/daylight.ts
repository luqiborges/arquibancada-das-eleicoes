const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (value: number) => { const t = clamp(value); return t * t * (3 - 2 * t); };
export function blendColor(a: string, b: string, amount: number) {
  const channels = [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - amount) + parseInt(b.slice(i, i + 2), 16) * amount));
  return `#${channels.map(value => value.toString(16).padStart(2, '0')).join('')}`;
}
export function daylight(minutes: number) {
  const hour = ((minutes % 1440) + 1440) % 1440 / 60;
  const night = hour < 12 ? 1 - smooth((hour - 5.5) / 1.5) : smooth((hour - 17) / 2);
  const dusk = hour < 12 ? Math.max(0, 1 - Math.abs(hour - 6.2) / 1.2) : Math.max(0, 1 - Math.abs(hour - 17.8) / 1.6);
  return {
    night,
    lamps: smooth((night - .15) / .7),
    top: blendColor('#b9dcf1', '#111a36', night),
    bottom: blendColor(blendColor('#edf3ed', '#f2a77d', dusk), '#26324d', night * .9),
  };
}
export type Daylight = ReturnType<typeof daylight>;
export const FLOODLIGHTS = [-1, 1].flatMap(x => [-1, 1].map(z => ({ x: x * 194, y: 72, z: z * 126 })));
export const ENTRANCE_LIGHTS = [.12, .48, .83].map((t, i) => ({
  x: -50 * (1 - t) ** 2 + (i % 2 ? -21 : 21), y: 32, z: 255 - 91 * t,
}));

// A cobertura acompanha as coordenadas da cena, independentemente da câmera.
export function floodlightCoverage(point: { x: number; z: number }) {
  const arena = 1 - smooth((Math.hypot(point.x / 220, point.z / 173) - 1) / .2);
  const t = clamp((255 - point.z) / 91);
  const roadX = -50 * (1 - t) ** 2;
  const road = (1 - smooth((Math.abs(point.x - roadX) - 14) / 24))
    * (1 - smooth((164 - point.z) / 18)) * (1 - smooth((point.z - 255) / 18));
  return Math.max(arena, road);
}
