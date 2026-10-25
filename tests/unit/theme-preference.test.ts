import test from 'node:test';
import assert from 'node:assert/strict';
import { parseThemePreference, themeMinutes } from '../../src/theme/preference.ts';
import { timeOfDayTheme } from '../../src/theme/timeOfDay.ts';

test('preferência ausente ou inválida volta ao automático', () => {
  for (const value of [null, '', 'unknown', 'null']) assert.equal(parseThemePreference(value), 'auto');
  for (const value of ['auto', 'light', 'dark'] as const) assert.equal(parseThemePreference(value), value);
});
test('tema fixo conserva sua aparência enquanto automático acompanha o relógio', () => {
  for (const minute of [0, 720, 1050, 1080, 1140]) {
    assert.equal(timeOfDayTheme(themeMinutes(minute, 'light')).scheme, 'light');
    assert.equal(timeOfDayTheme(themeMinutes(minute, 'dark')).scheme, 'dark');
    assert.equal(themeMinutes(minute, 'auto'), minute);
  }
});
