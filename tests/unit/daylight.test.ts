import test from 'node:test';
import assert from 'node:assert/strict';
import { daylight, floodlightCoverage } from '../../src/features/grandstands/scene/daylight.ts';
import { entrancePoint } from '../../src/features/grandstands/scene/entrance.ts';
import { places3D } from '../../src/features/grandstands/scene/geometry.ts';

test('refletores cobrem todos os assentos e o percurso de entrada, preservando o entorno escuro', () => {
  for (const seat of places3D) assert.ok(floodlightCoverage(seat) > .95);
  for (let i = 0; i <= 100; i++) for (const lane of [-1, 0, 1]) assert.ok(floodlightCoverage(entrancePoint(i / 100, lane)) > .95);
  assert.equal(floodlightCoverage({ x: 290, z: 250 }), 0);
});
test('dia tem luz natural, noite acende refletores e amanhecer os apaga', () => {
  assert.equal(daylight(12 * 60).night, 0);
  assert.equal(daylight(12 * 60).lamps, 0);
  assert.equal(daylight(19 * 60).night, 1);
  assert.equal(daylight(19 * 60).lamps, 1);
  assert.equal(daylight(7 * 60).lamps, 0);
  assert.ok(daylight(18 * 60).night > daylight(17.5 * 60).night);
});
test('ciclo é contínuo na meia-noite e intensidade fica nos limites durante todo o dia', () => {
  assert.deepEqual(daylight(0), daylight(1440));
  assert.deepEqual(daylight(-60), daylight(1380));
  for (let minute = 0; minute < 1440; minute++) {
    const light = daylight(minute);
    assert.ok(light.night >= 0 && light.night <= 1 && light.lamps >= 0 && light.lamps <= 1);
    assert.match(light.top, /^#[0-9a-f]{6}$/i);
    assert.match(light.bottom, /^#[0-9a-f]{6}$/i);
  }
});
