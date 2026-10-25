import { box } from './geometry.ts';
import type { Face } from './geometry.ts';

function oval(x: number, z: number, rx: number, rz: number, color: string): Face {
  return {
    points: Array.from({ length: 64 }, (_, i) => ({
      x: x + rx * Math.cos(i / 64 * Math.PI * 2),
      y: -2.5,
      z: z + rz * Math.sin(i / 64 * Math.PI * 2)
    })),
    color
  };
}

export function environmentGround(): Face[] {
  return [oval(0, 12, 292, 259, '#e5edcf'), oval(0, 0, 252, 182, '#e7dfd1')];
}

function tree(x: number, z: number, variant: number): Face[] {
  const colors = ['#50875c', '#6ba367', '#3e704e', '#85b276'];
  const faces = box(x, 0, z, 3, 12, 3, ['#96715b', '#72513f', '#b28e6d']);
  const top = { x: x - 1, y: 28 - variant, z };
  const middle = Array.from({ length: 8 }, (_, i) => ({
    x: x + 11 * Math.cos(i / 8 * Math.PI * 2),
    y: 16,
    z: z + 11 * Math.sin(i / 8 * Math.PI * 2)
  }));
  const bottom = { x, y: 10, z };
  for (let i = 0; i < 8; i++) {
    faces.push({ points: [top, middle[i], middle[(i + 1) % 8]], color: colors[(i + variant) % 4] });
    faces.push({ points: [bottom, middle[(i + 1) % 8], middle[i]], color: colors[(i + variant + 2) % 4] });
  }
  return faces;
}

function planter(x: number, z: number): Face[] {
  const faces = box(x, 0, z, 29, 3.5, 10, ['#c4b2a0', '#ac9784', '#ded1bd']);
  faces.push(...box(x, 3.5, z, 26, .6, 8, ['#6b8760', '#58754d', '#7fa16c']));
  for (let i = 0; i < 7; i++) {
    const px = x - 11 + i * 3.5, pz = z + (i % 2 ? 1.5 : -1.5);
    const color = ['#e6879c', '#efc65e', '#a594c4'][i % 3];
    faces.push(...box(px, 4, pz, .9, 2.5, .9, ['#5c874e', '#5c874e', '#5c874e']));
    faces.push(...box(px, 6, pz, 2.8, 1.2, 2.8, [color, color, '#ffefd0']));
  }
  return faces;
}

function bench(x: number, z: number): Face[] {
  return [
    ...box(x - 7, 0, z, 2, 4, 6, ['#756b68', '#5f5654', '#978b83']),
    ...box(x + 7, 0, z, 2, 4, 6, ['#756b68', '#5f5654', '#978b83']),
    ...box(x, 4, z, 22, 1.5, 7, ['#ae7e57', '#93653e', '#c3976c']),
    ...box(x, 5, z - 3, 22, 5, 1.5, ['#ae7e57', '#93653e', '#c3976c'])
  ];
}

export function environmentGeometry(green: boolean): Face[] {
  const faces: Face[] = [];
  const colors = green ? ['#15803d', '#0b5b2b', '#36b569'] : ['#dc2626', '#a61920', '#f85b55'];
  const positions = [
    [-235, -84],
    [-178, -163],
    [-50, -203],
    [83, -196],
    [205, -140],
    [237, 26],
    [216, 127],
    [-224, 106],
    [-175, 175],
    [143, 212]
  ];
  positions.forEach(([x, z], i) => faces.push(...tree(x, z, i % 3)));
  for (const [x, z] of [[-96, 196], [78, 195], [-247, 15], [234, -66]])
    faces.push(...planter(x, z));
  for (const [x, z] of [[-132, 171], [121, 168]])
    faces.push(...bench(x, z));
  for (const x of [-31, 31]) {
    faces.push(...box(x, 0, 180, 1.4, 26, 1.4, ['#b0a7a1', '#8c827d', '#d8d0c9']));
    faces.push({
      points: [{ x, y: 26, z: 180 }, { x: x + 13, y: 23, z: 180 }, { x, y: 19, z: 180 }],
      color: colors[0]
    });
    faces.push({
      points: [{ x, y: 26, z: 180 }, { x: x + 13, y: 23, z: 180 }, { x: x + 7, y: 24.5, z: 182 }],
      color: colors[2]
    });
  }
  // Little pennants frame the gate while leaving the passage clear.
  for (let i = 0; i < 8; i++) {
    const x = -28 + i * 8, y = 24 - Math.sin(i / 7 * Math.PI) * 3;
    faces.push({
      points: [{ x, y, z: 178 }, { x: x + 6, y: y - .3, z: 178 }, { x: x + 3, y: y - 5, z: 178 }],
      color: i % 2 ? '#fff5df' : colors[0]
    });
  }
  for (const [x, z] of [[-214, -129], [223, -105]]) {
    faces.push(...box(x, 0, z, 1.5, 34, 1.5, ['#968f8c', '#78716f', '#c7c0b9']));
    faces.push(...box(x, 33, z, 12, 2.4, 4, ['#b4a995', '#968b76', '#fff0bc']));
  }
  // A compact striped kiosk lives beside the road, outside the seating bowl.
  faces.push(...box(-119, 0, 223, 26, 13, 16, ['#dbbf9f', '#c5a180', '#f2d7b3']));
  faces.push(...box(-119, 13, 223, 30, 2, 21, colors));
  for (let i = 0; i < 6; i++)
    faces.push(...box(-131.5 + i * 5, 15, 223, 5, 1.2, 21, i % 2 ? ['#fff6df', '#e5dcc9', '#fffaf0'] : colors));
  faces.push(...box(-119, 7, 232, 18, 4, .8, ['#f9e8d2', '#e6ccb0', '#fff4e5']));
  return faces;
}
