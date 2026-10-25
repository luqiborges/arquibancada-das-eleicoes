import { box } from './geometry.ts';
import type { Face, Vec3 } from './geometry.ts';

export const CELEBRATION_SECONDS = 8;
const gold = ['#c58b17', '#e8af29', '#ffe494'];

function lathe(rings: {
  y: number;
  r: number;
}[], colors: string[], x = 0, z = 0): Face[] {
  const faces: Face[] = [];
  for (let ring = 0; ring < rings.length - 1; ring++)
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2, b = (i + 1) / 16 * Math.PI * 2;
      const point = (angle: number, j: number) => ({
        x: x + rings[j].r * Math.cos(angle),
        y: rings[j].y,
        z: z + rings[j].r * Math.sin(angle)
      });
      faces.push({
        points: [point(a, ring), point(b, ring), point(b, ring + 1), point(a, ring + 1)],
        color: colors[Math.floor(i / 16 * colors.length)]
      });
    }
  return faces;
}

function limb(a: Vec3, b: Vec3, color: string): Face[] {
  const dx = b.x - a.x, dy = b.y - a.y, length = Math.hypot(dx, dy);
  const ox = dy / length * 1.6, oy = -dx / length * 1.6;
  return [
    {
      points: [
        { x: a.x - ox, y: a.y - oy, z: 2 },
        { x: a.x + ox, y: a.y + oy, z: 2 },
        { x: b.x + ox, y: b.y + oy, z: 2 },
        { x: b.x - ox, y: b.y - oy, z: 2 }
      ],
      color
    },
    {
      points: [
        { x: a.x + ox, y: a.y + oy, z: 2 },
        { x: a.x + ox, y: a.y + oy, z: -2 },
        { x: b.x + ox, y: b.y + oy, z: -2 },
        { x: b.x + ox, y: b.y + oy, z: 2 }
      ],
      color: '#b97e59'
    },
  ];
}

export function celebrationGeometry(seconds: number, green: boolean): Face[] {
  const t = Math.max(0, Math.min(CELEBRATION_SECONDS, seconds));
  const lift = 1 - Math.pow(1 - Math.min(1, t / 2), 3);
  const base = 5, hand = base + 22 + lift * 17;
  const colors = green ? ['#15803d', '#0b5b2b', '#36b569'] : ['#dc2626', '#a61920', '#f85b55'];
  const faces = [
    ...box(0, 1, 0, 34, 4, 25, ['#655b68', '#514652', '#8d7d89']),
    ...box(0, 4.5, 0, 35, .8, 26, gold)
  ];
  faces.push(...box(-3, base, 0, 3.5, 9, 4, ['#3f3b45', '#2d2932', '#625e69']), ...box(3, base, 0, 3.5, 9, 4, ['#3f3b45', '#2d2932', '#625e69']));
  faces.push(...box(0, base + 9, 0, 11, 12, 6, colors));
  faces.push(...limb({ x: -5, y: base + 19, z: 0 }, { x: -9, y: hand, z: 0 }, '#e7b78e'), ...limb({ x: 5, y: base + 19, z: 0 }, { x: 9, y: hand, z: 0 }, '#e7b78e'));
  faces.push(...lathe([
    { y: base + 21, r: 0 },
    { y: base + 22, r: 3.7 },
    { y: base + 26, r: 4.5 },
    { y: base + 30, r: 3.2 },
    { y: base + 31, r: 0 }
  ], ['#ad7654', '#d4a17a', '#f2cfac']));
  const trophy = hand + 1;
  faces.push(...box(0, trophy, 0, 14, 2.5, 9, ['#302b35', '#463b49', '#605269']));
  faces.push(...lathe([
    { y: trophy + 2.5, r: 4.5 },
    { y: trophy + 4, r: 4.5 },
    { y: trophy + 5, r: 1.8 },
    { y: trophy + 9, r: 1.8 },
    { y: trophy + 10, r: 3 },
    { y: trophy + 13, r: 6 },
    { y: trophy + 19, r: 8.5 },
    { y: trophy + 20, r: 8.5 }
  ], gold));
  // A dark inner bowl and bright lip make the silhouette read as a cup.
  faces.push(...lathe([{ y: trophy + 19.5, r: 7 }, { y: trophy + 19.5, r: 0 }], ['#996211', '#bc8319', '#cf9621']));
  for (const side of [-1, 1]) {
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2, b = (i + 1) / 16 * Math.PI * 2;
      const point = (angle: number, r: number) => ({ x: side * 8 + Math.cos(angle) * r, y: trophy + 14 + Math.sin(angle) * r, z: 0 });
      faces.push({ points: [point(a, 4.8), point(b, 4.8), point(b, 3.3), point(a, 3.3)], color: '#f9cf5a' });
    }
  }
  if (t > .5 && t < 7) {
    for (let i = 0; i < 65; i++) {
      const random = (n: number) => Math.abs(Math.sin(n * 127.1 + 311.7) * 43758.5453) % 1;
      const age = t - .5;
      const x = (random(i + 1) - .5) * 130 * Math.min(1, age), z = (random(i + 71) - .5) * 90;
      const y = 30 + random(i + 141) * 70 + age * 12 - age * age * 3;
      if (y < 3)
        continue;
      faces.push({
        points: [
          { x, y, z },
          { x: x + 2, y: y + 3, z: z + 1 },
          { x: x + 4, y: y + 1, z: z + 2 },
          { x: x + 2, y: y - 2, z: z + 1 }
        ],
        color: ['#e8af29', green ? '#22c55e' : '#ef4444', '#fff9dd', '#b5838d'][i % 4]
      });
    }
  }
  return faces;
}
