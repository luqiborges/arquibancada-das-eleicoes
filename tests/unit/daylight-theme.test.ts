import test from 'node:test';
import assert from 'node:assert/strict';
import { timeOfDayTheme } from '../../src/theme/timeOfDay.ts';

function contrast(a: string, b: string) {
  const luminance = (hex: string) => {
    const channels = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
    return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
  };
  const first = luminance(a), second = luminance(b);
  return (Math.max(first, second) + .05) / (Math.min(first, second) + .05);
}
test('tema muda com o ciclo e retorna ao claro ao amanhecer', () => {
  assert.equal(timeOfDayTheme(720).background, '#f5f5f7');
  assert.equal(timeOfDayTheme(1140).background, '#171c26');
  assert.equal(timeOfDayTheme(420).scheme, 'light');
  assert.deepEqual(timeOfDayTheme(0), timeOfDayTheme(1440));
});
test('textos, controles e candidatos preservam contraste ao longo da transição', () => {
  for (let minutes = 0; minutes < 1440; minutes++) {
    const theme = timeOfDayTheme(minutes);
    for (const background of [theme.background, theme.surface, theme.soft, theme.redSurface, theme.greenSurface]) {
      for (const foreground of [theme.text, theme.muted, theme.accent]) assert.ok(contrast(foreground, background) >= 4.5, `contraste em ${minutes}: ${foreground} / ${background}`);
    }
    // Nomes de candidatos usam texto grande em negrito (mínimo 3:1).
    for (const foreground of [theme.red, theme.green]) assert.ok(contrast(foreground, theme.surface) >= 3);
    assert.ok(contrast(theme.red, theme.redSurface) >= 4.5);
    assert.ok(contrast(theme.green, theme.greenSurface) >= 4.5);
  }
});

test('entardecer conserva texto escuro em cartões claros e troca o conjunto às 18h', () => {
  for (const minute of [17 * 60 + 30, 17 * 60 + 45, 17 * 60 + 59]) {
    const theme = timeOfDayTheme(minute);
    assert.equal(theme.scheme, 'light');
    assert.equal(theme.text, '#353139');
    assert.ok(contrast(theme.muted, theme.surface) >= 7);
  }
  for (const minute of [18 * 60, 18 * 60 + 15, 19 * 60]) {
    const theme = timeOfDayTheme(minute);
    assert.equal(theme.scheme, 'dark');
    assert.equal(theme.text, '#f2f3f6');
    assert.ok(contrast(theme.muted, theme.surface) >= 7);
  }
});
