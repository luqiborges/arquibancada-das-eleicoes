import { useEffect, useState } from 'react';
import { parseThemePreference, THEME_PREFERENCE_KEY } from '../theme/preference';
import type { ThemePreference } from '../theme/preference';

function readPreference() {
  try { return parseThemePreference(localStorage.getItem(THEME_PREFERENCE_KEY)); }
  catch { return 'auto'; }
}

export function useThemePreference() {
  const [preference, setPreference] = useState<ThemePreference>(readPreference);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === THEME_PREFERENCE_KEY || event.key === null) setPreference(readPreference());
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);
  const choose = (value: ThemePreference) => {
    setPreference(value);
    try { localStorage.setItem(THEME_PREFERENCE_KEY, value); }
    catch { /* A escolha continua funcionando nesta aba sem armazenamento. */ }
  };
  return [preference, choose] as const;
}
