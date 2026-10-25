import { useEffect, useMemo, useState } from 'react';
import { daylight } from '../features/grandstands/scene/daylight';
import { paletteForTime } from '../theme/palettes';
import { themeMinutes } from '../theme/preference';
import type { ThemePreference } from '../theme/preference';

function localMinutes() {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
}

export function useLocalDaylight(preference: ThemePreference = 'auto') {
  const [minutes, setMinutes] = useState(localMinutes);
  useEffect(() => {
    const update = () => { if (!document.hidden) setMinutes(localMinutes()); };
    update();
    const timer = setInterval(update, 10000);
    document.addEventListener('visibilitychange', update);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, []);
  const lighting = useMemo(() => daylight(minutes), [minutes]);
  const appearance = useMemo(() => paletteForTime(themeMinutes(minutes, preference)), [minutes, preference]);
  return { lighting, ...appearance };
}
