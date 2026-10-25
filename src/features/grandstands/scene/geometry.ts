export type Vec3 = {
  x: number;
  y: number;
  z: number;
};

export interface Camera3D {
  yaw: number;
  pitch: number;
  zoom: number;
}

export const DEFAULT_CAMERA: Camera3D = { yaw: -.35, pitch: .66, zoom: 1 };

export function project(point: Vec3, camera: Camera3D, width: number, height: number) {
  const x = point.x * Math.cos(camera.yaw) - point.z * Math.sin(camera.yaw);
  const z = point.x * Math.sin(camera.yaw) + point.z * Math.cos(camera.yaw);
  const y = point.y - 16;
  const vertical = y * Math.cos(camera.pitch) - z * Math.sin(camera.pitch);
  const depth = y * Math.sin(camera.pitch) + z * Math.cos(camera.pitch);
  const scale = Math.min(width / 650, height / 460) * 1.5 * camera.zoom * 850 / (850 - depth);
  return { x: width / 2 + x * scale, y: height * .52 - vertical * scale, depth, scale };
}

export interface Face {
  points: Vec3[];
  color: string;
}

export function box(x: number, y: number, z: number, w: number, h: number, d: number, colors: string[]): Face[] {
  const a = { x: x - w / 2, y, z: z - d / 2 }, b = { x: x + w / 2, y, z: z - d / 2 }, c = { x: x + w / 2, y, z: z + d / 2 }, e = { x: x - w / 2, y, z: z + d / 2 };
  const up = (p: Vec3) => ({ ...p, y: y + h });
  return [
    { points: [a, b, up(b), up(a)], color: colors[0] },
    { points: [b, c, up(c), up(b)], color: colors[1] },
    { points: [c, e, up(e), up(c)], color: colors[1] },
    { points: [e, a, up(a), up(e)], color: colors[0] },
    { points: [up(a), up(b), up(c), up(e)], color: colors[2] },
  ];
}

export const places3D = Array.from({ length: 800 }, (_, i) => {
  const row = Math.floor(i / 80), col = i % 80;
  const angle = (col + .5) / 80 * Math.PI * 2;
  return {
    x: (122 + row * 9) * Math.cos(angle),
    z: (79 + row * 8) * Math.sin(angle),
    y: 8 + row * 4.5,
    angle
  };
});

export function stadiumGeometry(): Face[] {
  const faces: Face[] = [];
  for (let row = 9; row >= 0; row--) {
    const rx = 126 + row * 9, rz = 83 + row * 8, y = 8 + row * 4.5;
    for (let col = 0; col < 80; col++) {
      const a = col / 80 * Math.PI * 2, b = (col + 1) / 80 * Math.PI * 2;
      const point = (angle: number, r: number, height: number) => ({ x: (rx + r) * Math.cos(angle), y: height, z: (rz + r) * Math.sin(angle) });
      faces.push({
        points: [point(a, -9, y), point(b, -9, y), point(b, 0, y), point(a, 0, y)],
        color: col % 20 === 0 ? '#c8bec4' : row % 2 ? '#e4dce0' : '#eee7e9'
      });
      faces.push({
        points: [point(a, 0, y), point(b, 0, y), point(b, 0, y - 4.5), point(a, 0, y - 4.5)],
        color: '#bbb0ba'
      });
    }
  }
  for (let i = 0; i < 10; i++)
    faces.push({
      points: [
        { x: -91 + i * 18.2, y: 1, z: -53 },
        { x: -91 + (i + 1) * 18.2, y: 1, z: -53 },
        { x: -91 + (i + 1) * 18.2, y: 1, z: 53 },
        { x: -91 + i * 18.2, y: 1, z: 53 }
      ],
      color: i % 2 ? '#668b70' : '#70977b'
    });
  return faces;
}
