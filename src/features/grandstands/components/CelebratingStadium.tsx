import { useEffect, useState } from 'react';

import StadiumScene3D from './StadiumScene3D';
import type { Camera3D } from '../scene/geometry';
import { CELEBRATION_SECONDS } from '../scene/trophy';

type CelebratingStadiumProps = {
  filled: number;
  green: boolean;
  camera: Camera3D;
  onCamera: (camera: Camera3D) => void;
  celebrate: boolean;
  entranceMotion?: boolean;
  gateOpen?: boolean;
  environment?: boolean;
};

export default function CelebratingStadium({
  filled,
  green,
  camera,
  onCamera,
  celebrate,
  entranceMotion = true,
  gateOpen = true,
  environment = false,
}: CelebratingStadiumProps) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    setSeconds(0);
    if (!celebrate)
      return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setSeconds(CELEBRATION_SECONDS);
      return;
    }
    let elapsed = 0;
    let previous = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      if (!document.hidden)
        elapsed += (now - previous) / 1000;
      previous = now;
      setSeconds(Math.min(CELEBRATION_SECONDS, elapsed));
      if (elapsed >= CELEBRATION_SECONDS)
        clearInterval(timer);
    }, 100);
    return () => clearInterval(timer);
  }, [celebrate]);
  return <StadiumScene3D
    filled={filled}
    green={green}
    camera={camera}
    onCamera={onCamera}
    celebration={celebrate ? seconds : undefined}
    entranceMotion={entranceMotion}
    gateOpen={gateOpen}
    environment={environment}
  />;
}
