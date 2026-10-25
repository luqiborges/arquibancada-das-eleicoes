export const THEME_PREFERENCE_KEY = 'arquibancada.theme';
export type ThemePreference = 'auto' | 'light' | 'dark';

export function parseThemePreference(value: string | null): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'auto';
}

export function themeMinutes(minutes: number, preference: ThemePreference) {
  return preference === 'light' ? 720 : preference === 'dark' ? 1140 : minutes;
}
