import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';

import { box, places3D, project, stadiumGeometry } from '../scene/geometry';
import type { Camera3D, Face, Vec3 } from '../scene/geometry';
import { celebrationGeometry } from '../scene/trophy';
import { gateGeometry, roadGeometry, walkerGeometry } from '../scene/entrance';
import { environmentGeometry, environmentGround } from '../scene/environment';
import { blendColor, ENTRANCE_LIGHTS, floodlightCoverage, FLOODLIGHTS } from '../scene/daylight';
import type { Daylight } from '../scene/daylight';

const architecture = stadiumGeometry();

type Shape = {
  depth: number;
  draw: () => void;
};

type StadiumScene3DProps = {
  filled: number;
  green: boolean;
  camera: Camera3D;
  onCamera: (camera: Camera3D) => void;
  celebration?: number;
  entranceMotion?: boolean;
  gateOpen?: boolean;
  environment?: boolean;
  wideView?: boolean;
  lighting: Daylight;
};

export default function StadiumScene3D({
  filled,
  green,
  camera,
  onCamera,
  celebration,
  entranceMotion = true,
  gateOpen = true,
  environment = false,
  wideView = environment,
  lighting,
}: StadiumScene3DProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    camera: Camera3D;
    pointer: number;
  } | null>(null);
  const [size, setSize] = useState({ width: 600, height: 440 });
  const [unavailable, setUnavailable] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const walkTime = useRef(0);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    const element = canvas.current;
    if (!element)
      return;
    const observer = new ResizeObserver(entries => {
      const width = Math.round(entries[0].contentRect.width);
      if (width > 0)
        setSize({ width, height: Math.max(300, Math.round(width * (wideView ? .9 : .76))) });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [wideView]);
  useEffect(() => {
    const element = canvas.current;
    const ctx = element?.getContext('2d', { alpha: false });
    if (!element || !ctx) {
      setUnavailable(true);
      return;
    }
    let frame = requestAnimationFrame(() => {
      const { width, height } = size;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      element.width = Math.round(width * dpr);
      element.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const colorCache = new Map<string, string>();
      const litColor = (color: string, position?: Vec3) => {
        const coverage = position ? Math.round(floodlightCoverage(position) * 20) / 20 : 0;
        const key = `${color}:${coverage}`;
        if (!colorCache.has(key)) {
          const lamp = coverage * lighting.lamps;
          const ambient = blendColor(color, '#17243b', lighting.night * .5 * (1 - lamp * .97));
          colorCache.set(key, blendColor(ambient, '#fff5d3', lamp * .035));
        }
        return colorCache.get(key)!;
      };
      {
        const sky = ctx.createLinearGradient(0, 0, 0, height);
        sky.addColorStop(0, lighting.top); sky.addColorStop(1, lighting.bottom);
        ctx.fillStyle = sky; ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = `rgba(255,248,220,${lighting.night * .8})`;
        for (let i = 0; i < 40; i++) {
          ctx.beginPath(); ctx.arc((i * .618 % 1) * width, (i * .317 % 1) * height * .26, i % 4 === 0 ? 1.4 : .8, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = `rgba(255,247,210,${lighting.night})`;
        ctx.beginPath(); ctx.arc(width * .84, height * .12, 11, 0, Math.PI * 2); ctx.fill();
      }
      const p = (v: Vec3) => {
        const point = project(v, { ...camera, zoom: camera.zoom * (wideView ? .7 : .88) }, width, height);
        return { ...point, y: point.y - height * .08 };
      };
      if (environment)
        environmentGround().forEach(face => {
          const points = face.points.map(p);
          ctx.beginPath();
          points.forEach((point, i) => i ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y));
          ctx.closePath();
          ctx.fillStyle = litColor(face.color);
          ctx.fill();
        });
      // Ground shadows remain on the ground plane as the camera turns.
      const shadow = Array.from({ length: 80 }, (_, i) => p({
        x: 223 * Math.cos(i / 80 * Math.PI * 2),
        y: -2,
        z: 164 * Math.sin(i / 80 * Math.PI * 2)
      }));
      ctx.beginPath();
      shadow.forEach((v, i) => i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y));
      ctx.closePath();
      ctx.fillStyle = '#6d68751b';
      ctx.fill();
      const shapes: Shape[] = [];
      const addFace = (face: Face, target: Shape[] = shapes) => {
        const points = face.points.map(p);
        const center = face.points.reduce((sum, v) => ({ x: sum.x + v.x / face.points.length, y: sum.y + v.y / face.points.length, z: sum.z + v.z / face.points.length }), { x: 0, y: 0, z: 0 });
        const color = litColor(face.color, center);
        const draw = () => {
          ctx.beginPath();
          points.forEach((v, i) => i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y));
          ctx.closePath();
          ctx.fillStyle = color;
          ctx.fill();
        };
        if (['#668b70', '#70977b', '#b7a8a0', '#f6e8cf'].includes(face.color))
          draw();
        else
          target.push({ depth: points.reduce((sum, v) => sum + v.depth, 0) / points.length, draw });
      };
      roadGeometry().forEach(face => addFace(face));
      if (environment)
        environmentGeometry(green).forEach(face => addFace(face));
      gateGeometry(green, gateOpen).forEach(face => addFace(face));
      architecture.forEach(face => addFace(face));
      {
        for (const light of FLOODLIGHTS) {
          box(light.x, 0, light.z, 2.2, 72, 2.2, ['#929aa8', '#677384', '#d1d8df']).forEach(face => addFace(face));
          box(light.x, 70, light.z, 22, 7, 6, ['#e2e3d4', '#a6a99c', '#fff6d5']).forEach(face => addFace(face));
        }
        for (const light of ENTRANCE_LIGHTS) {
          box(light.x, 0, light.z, 1.8, light.y, 1.8, ['#929aa8', '#677384', '#d1d8df']).forEach(face => addFace(face));
          box(light.x, light.y - 1, light.z, 10, 3, 5, ['#e2e3d4', '#a6a99c', '#fff6d5']).forEach(face => addFace(face));
          const centerX = light.x + (light.x > -20 ? -12 : 12);
          const pool = Array.from({ length: 48 }, (_, i) => p({ x: centerX + 27 * Math.cos(i / 48 * Math.PI * 2), y: .7, z: light.z + 24 * Math.sin(i / 48 * Math.PI * 2) }));
          ctx.beginPath(); pool.forEach((v, i) => i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)); ctx.closePath();
          ctx.fillStyle = `rgba(255,239,181,${lighting.lamps * .19})`; ctx.fill();
        }
        // Luz no gramado, antes de desenhar arquibancadas e pessoas.
        const pool = Array.from({ length: 64 }, (_, i) => p({ x: 100 * Math.cos(i / 64 * Math.PI * 2), y: 1.05, z: 60 * Math.sin(i / 64 * Math.PI * 2) }));
        ctx.beginPath(); pool.forEach((v, i) => i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y)); ctx.closePath();
        ctx.fillStyle = `rgba(245,244,185,${lighting.lamps * .16})`; ctx.fill();
      }
      const clothing = green ? ['#15803d', '#0b5b2b', '#36b569'] : ['#dc2626', '#a61920', '#f85b55'];
      places3D.forEach((position, i) => {
        const occupied = i < filled;
        if (!occupied) {
          box(position.x, position.y + .4, position.z, 4.2, 1.6, 3.4, ['#bdb0b8', '#a99da6', '#d5c8cf']).forEach(face => addFace(face));
          return;
        }
        // Solid bodies and legs, with a shaded spherical head.
        box(position.x - 1.25, position.y, position.z, 1.6, 3.5, 2, ['#44424b', '#37353d', '#625e69']).forEach(face => addFace(face));
        box(position.x + 1.25, position.y, position.z, 1.6, 3.5, 2, ['#44424b', '#37353d', '#625e69']).forEach(face => addFace(face));
        box(position.x, position.y + 3.5, position.z, 5, 5, 3, clothing).forEach(face => addFace(face));
        const head = p({ ...position, y: position.y + 10.4 });
        const skin = ['#e7b78e', '#b97e59', '#895c42', '#f2cfac'][i % 4];
        shapes.push({
          depth: head.depth + .3,
          draw: () => {
            const radius = 2.15 * head.scale;
            const gradient = ctx.createRadialGradient(head.x - radius * .3, head.y - radius * .4, radius * .1, head.x, head.y, radius);
            gradient.addColorStop(0, litColor(skin, position));
            gradient.addColorStop(1, litColor(['#b7805b', '#865438', '#5d3d2e', '#bd9475'][i % 4], position));
            ctx.beginPath();
            ctx.arc(head.x, head.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
          }
        });
      });
      // Paint ground markings before elevated geometry, so the crowd occludes them.
      const line = (points: Vec3[]) => {
        const pts = points.map(p);
        const draw = () => {
          ctx.beginPath();
          pts.forEach((v, i) => i ? ctx.lineTo(v.x, v.y) : ctx.moveTo(v.x, v.y));
          ctx.strokeStyle = '#f9f7edcc';
          ctx.lineWidth = 1;
          ctx.stroke();
        };
        if (points.every(point => point.y === 1.1))
          draw();
        else
          shapes.push({ depth: pts.reduce((s, v) => s + v.depth, 0) / pts.length + .01, draw });
      };
      const rect = (x: number, z: number, w: number, d: number) => line([
        { x, y: 1.1, z },
        { x: x + w, y: 1.1, z },
        { x: x + w, y: 1.1, z: z + d },
        { x, y: 1.1, z: z + d },
        { x, y: 1.1, z }
      ]);
      rect(-86, -48, 172, 96);
      line([{ x: 0, y: 1.1, z: -48 }, { x: 0, y: 1.1, z: 48 }]);
      rect(-86, -24, 25, 48);
      rect(61, -24, 25, 48);
      line(Array.from({ length: 41 }, (_, i) => ({ x: 15 * Math.cos(i / 40 * Math.PI * 2), y: 1.1, z: 15 * Math.sin(i / 40 * Math.PI * 2) })));
      // White goal posts provide a useful sense of height.
      for (const x of [-88, 88]) {
        line([{ x, y: 1, z: -12 }, { x, y: 8, z: -12 }, { x, y: 8, z: 12 }, { x, y: 1, z: 12 }]);
      }
      if (celebration !== undefined)
        celebrationGeometry(celebration, green).forEach(face => addFace(face));
      shapes.sort((a, b) => a.depth - b.depth);
      // Cache the ground and projected stadium; only the small entrance crowd
      // needs new geometry between vote updates or camera movements.
      const ground = document.createElement('canvas');
      ground.width = element.width;
      ground.height = element.height;
      ground.getContext('2d')?.drawImage(element, 0, 0);
      const moving = entranceMotion && gateOpen && !reducedMotion;
      const draw = () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(ground, 0, 0);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const walkers: Shape[] = [];
        walkerGeometry(walkTime.current, green, moving, gateOpen).forEach(face => addFace(face, walkers));
        walkers.sort((a, b) => a.depth - b.depth);
        let a = 0, b = 0;
        while (a < shapes.length || b < walkers.length) {
          if (b >= walkers.length || (a < shapes.length && shapes[a].depth <= walkers[b].depth))
            shapes[a++].draw();
          else
            walkers[b++].draw();
        }
        if (lighting.lamps > 0) {
          for (const source of [...FLOODLIGHTS, ...ENTRANCE_LIGHTS, { x: -214, y: 34, z: -129 }, { x: 223, y: 34, z: -105 }]) {
            const light = p(source), radius = (source.y > 40 ? 29 : 16) * light.scale;
            const glow = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, radius);
            glow.addColorStop(0, `rgba(255,250,211,${lighting.lamps * .95})`);
            glow.addColorStop(.22, `rgba(255,236,157,${lighting.lamps * .5})`);
            glow.addColorStop(1, 'rgba(255,236,157,0)');
            ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(light.x, light.y, radius, 0, Math.PI * 2); ctx.fill();
          }
        }
      };
      draw();
      if (moving) {
        let previous = performance.now(), lastDraw = previous;
        const animate = (now: number) => {
          if (!document.hidden)
            walkTime.current += Math.min((now - previous) / 1000, .2);
          previous = now;
          if (!document.hidden && now - lastDraw >= 100) {
            draw();
            lastDraw = now;
          }
          frame = requestAnimationFrame(animate);
        };
        frame = requestAnimationFrame(animate);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [
    filled,
    green,
    camera,
    size,
    celebration,
    entranceMotion,
    reducedMotion,
    gateOpen,
    environment,
    wideView,
    lighting
  ]);
  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drag.current || drag.current.pointer !== event.pointerId)
      return;
    const start = drag.current;
    onCamera({
      ...camera,
      yaw: start.camera.yaw + (event.clientX - start.x) * .008,
      pitch: Math.max(.35, Math.min(1.35, start.camera.pitch + (event.clientY - start.y) * .006))
    });
  };
  return <div className="scene3d-wrap">
    <canvas
      ref={canvas}
      className="scene3d"
      style={{ height: size.height }}
      aria-label={`Estádio tridimensional: ${filled} de 800 assentos ocupados.${environment ? ' Entorno com árvores, flores, bandeirinhas e quiosque.' : ''} ${gateOpen ? 'Portões abertos. Estradinha com pessoas decorativas.' : 'Portões fechados. Pessoinhas esperando na fila.'}${celebration !== undefined ? ' Comemoração: pessoa levantando um troféu no gramado.' : ''} Arraste para girar ou use os controles de câmera.`}
      role="img"
      onPointerDown={event => {
        drag.current = { x: event.clientX, y: event.clientY, camera, pointer: event.pointerId };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={move}
      onPointerUp={() => {
        drag.current = null;
      }}
      onPointerCancel={() => {
        drag.current = null;
      }}
      onLostPointerCapture={() => {
        drag.current = null;
      }}
    />
    {unavailable && <p role="alert">Este navegador não conseguiu desenhar a cena. <a href="/papo-serio">Acompanhe os votos no placar.</a></p>}
  </div>;
}
