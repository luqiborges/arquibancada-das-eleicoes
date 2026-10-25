import { box } from './geometry.ts';
import type { Face, Vec3 } from './geometry.ts';

export const ENTRANCE_CYCLE = 14;

export function entrancePoint(progress: number, lane = 0): Vec3 {
  const t = Math.max(0, Math.min(1, progress));
  return { x: -50 * (1 - t) * (1 - t) + lane * 6.5, y: .5, z: 255 - 91 * t };
}

export function roadGeometry(): Face[] {
  const faces: Face[] = [];
  for (let i = 0; i < 30; i++) {
    const a = entrancePoint(i / 30), b = entrancePoint((i + 1) / 30);
    faces.push({
      points: [
        { ...a, x: a.x - 12 },
        { ...a, x: a.x + 12 },
        { ...b, x: b.x + 12 },
        { ...b, x: b.x - 12 }
      ],
      color: '#b7a8a0'
    });
    if (i % 3 === 0)
      faces.push({
        points: [
          { ...a, x: a.x - .7, y: .6 },
          { ...a, x: a.x + .7, y: .6 },
          { ...b, x: b.x + .7, y: .6 },
          { ...b, x: b.x - .7, y: .6 }
        ],
        color: '#f6e8cf'
      });
  }
  return faces;
}

export function gateGeometry(green: boolean, open = true): Face[] {
  const frame = [
    ...box(-12, 0, 162, 4, 23, 6, ['#776a74', '#625661', '#a28e99']),
    ...box(12, 0, 162, 4, 23, 6, ['#776a74', '#625661', '#a28e99']),
    ...box(0, 21, 162, 28, 6, 7, green ? ['#15803d', '#0b5b2b', '#36b569'] : ['#dc2626', '#a61920', '#f85b55']),
  ];
  if (!open) {
    for (const x of [-8, -4, 0, 4, 8])
      frame.push(...box(x, 0, 165, 1.5, 21, 1.5, ['#6d6875', '#4d4855', '#a69da9']));
    frame.push(...box(0, 9, 165, 20, 1.5, 2, ['#6d6875', '#4d4855', '#a69da9']));
    frame.push(...box(0, 9, 167, 3, 3, 1, ['#c58b17', '#e8af29', '#ffe494']));
  }
  return frame;
}

export function walkersAt(seconds: number, moving = true, gateOpen = true) {
  return Array.from({ length: 15 }, (_, i) => {
    // Small groups approach in three lanes; each person disappears at the gate.
    const progress = gateOpen ? ((seconds / ENTRANCE_CYCLE + i / 15) % 1 + 1) % 1 : .88 - Math.floor(i / 3) * .11;
    const lane = i % 3 - 1;
    const point = entrancePoint(progress, lane);
    return {
      ...point,
      progress,
      phase: moving && gateOpen ? Math.sin(seconds * 8 + i * 1.7) : 0,
      id: i
    };
  });
}

export function walkerGeometry(seconds: number, green: boolean, moving = true, gateOpen = true): Face[] {
  const colors = green ? ['#15803d', '#0b5b2b', '#36b569'] : ['#dc2626', '#a61920', '#f85b55'];
  return walkersAt(seconds, moving, gateOpen).flatMap(person => {
    const { x, y, z, phase, id } = person;
    const bob = moving ? Math.abs(phase) * .35 : 0;
    const skin = ['#e7b78e', '#b97e59', '#895c42', '#f2cfac'][id % 4];
    return [
      ...box(x - 1.1, y, z + phase * .9, 1.6, 3.5, 2, ['#44424b', '#37353d', '#625e69']),
      ...box(x + 1.1, y, z - phase * .9, 1.6, 3.5, 2, ['#44424b', '#37353d', '#625e69']),
      ...box(x, y + 3.5 + bob, z, 4.5, 4.8, 2.8, colors),
      ...box(x - 2.9, y + 3.7 + bob, z - phase, 1.3, 3.7, 1.6, [skin, skin, skin]),
      ...box(x + 2.9, y + 3.7 + bob, z + phase, 1.3, 3.7, 1.6, [skin, skin, skin]),
      ...box(x, y + 8.3 + bob, z, 3.3, 3.3, 3.3, [skin, '#9c6c4d', skin]),
    ];
  });
}
