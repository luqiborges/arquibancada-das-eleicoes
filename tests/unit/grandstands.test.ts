import test from 'node:test';
import assert from 'node:assert/strict';
import { FIRST_ROUND, occupancy, SEAT_COUNT, STADIUM_CAPACITY, VOTES_PER_SEAT } from '../../src/features/grandstands/scale.ts';
import { DEFAULT_CAMERA, places3D, project } from '../../src/features/grandstands/scene/geometry.ts';
import { celebrationGeometry, CELEBRATION_SECONDS } from '../../src/features/grandstands/scene/trophy.ts';
import { ENTRANCE_CYCLE, entrancePoint, gateGeometry, walkersAt, walkerGeometry } from '../../src/features/grandstands/scene/entrance.ts';
import { APURACAO_START_AT, isEntranceOpen } from '../../src/domain/election/start.ts';

test('escala fixa tem 800 lugares e folga sobre os dois candidatos no primeiro turno', () => {
  assert.equal(SEAT_COUNT, 800);
  assert.equal(STADIUM_CAPACITY, 80000000);
  assert.ok(STADIUM_CAPACITY >= Math.max(...FIRST_ROUND.map(c => c.votes)) * 1.4);
});
test('assentos só enchem quando completam a quantidade de votos da escala', () => {
  assert.deepEqual(occupancy(0), { filled: 0, remainder: 0, overflow: 0 });
  assert.deepEqual(occupancy(VOTES_PER_SEAT - 1), { filled: 0, remainder: 99999, overflow: 0 });
  assert.deepEqual(occupancy(53876617), { filled: 538, remainder: 76617, overflow: 0 });
  assert.equal(occupancy(56104268).filled, 561);
});
test('lotação excedida preserva excedente e não altera escala', () => {
  assert.deepEqual(occupancy(81000000), { filled: 800, remainder: 0, overflow: 1000000 });
  assert.throws(() => occupancy(-1));
  assert.throws(() => occupancy(NaN));
});
test('estádio 3D usa a mesma capacidade e cabe no enquadramento inicial', () => {
  assert.equal(places3D.length, SEAT_COUNT);
  for (const width of [350, 650]) {
    const height = Math.max(300, width * .76);
    for (const seat of places3D) {
      const point = project(seat, DEFAULT_CAMERA, width, height);
      assert.ok(point.scale > 0 && Number.isFinite(point.depth));
      assert.ok(point.x > 0 && point.x < width);
      assert.ok(point.y > 0 && point.y < height);
    }
  }
});
test('comemoração mantém geometria válida e encerra os confetes com o troféu no alto', () => {
  for (const green of [false, true]) {
    const initial = celebrationGeometry(0, green);
    const burst = celebrationGeometry(1, green);
    const final = celebrationGeometry(CELEBRATION_SECONDS, green);
    assert.ok(burst.length > final.length);
    assert.ok(final.length > 0);
    assert.ok(Math.max(...final.flatMap(f => f.points.map(p => p.y))) > Math.max(...initial.flatMap(f => f.points.map(p => p.y))));
    for (const face of [...initial, ...burst, ...final])
      assert.ok(face.points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z)));
    assert.deepEqual(celebrationGeometry(100, green), final);
  }
});
test('entrada decorativa avança ao portão e reinicia sem alterar a lotação', () => {
  assert.ok(entrancePoint(0).z > entrancePoint(.5).z);
  assert.ok(entrancePoint(.5).z > entrancePoint(1).z);
  assert.deepEqual(entrancePoint(1), { x: 0, y: .5, z: 164 });
  const start = walkersAt(0), loop = walkersAt(ENTRANCE_CYCLE);
  assert.equal(start.length, 15);
  start.forEach((person, i) => assert.ok(Math.abs(person.z - loop[i].z) < 1e-8));
  assert.ok(walkersAt(3, false).every(person => person.phase === 0));
  for (const green of [true, false])
    assert.ok(walkerGeometry(4, green).every(face => face.points.every(p => Number.isFinite(p.x) && Number.isFinite(p.y) && Number.isFinite(p.z))));
  assert.equal(SEAT_COUNT, 800);
});
test('portões abrem às 17h de Brasília na data do segundo turno', () => {
  assert.equal(APURACAO_START_AT, Date.parse('2026-10-25T20:00:00Z'));
  assert.equal(isEntranceOpen(APURACAO_START_AT - 1), false);
  assert.equal(isEntranceOpen(APURACAO_START_AT), true);
  assert.equal(isEntranceOpen(APURACAO_START_AT + 86400000), true);
  assert.equal(isEntranceOpen(APURACAO_START_AT - 60000, 1), true);
});
test('portão fechado tem grade e a fila fica parada do lado de fora', () => {
  assert.ok(gateGeometry(false, false).length > gateGeometry(false, true).length);
  assert.deepEqual(walkersAt(0, true, false), walkersAt(30, true, false));
  assert.ok(walkersAt(20, true, false).every(person => person.z > 170 && person.phase === 0));
});
