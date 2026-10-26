import test from 'node:test';
import assert from 'node:assert/strict';
import { numeric, parseResult, resultUrl } from '../../src/services/tse.ts';
import { officialWinner } from '../../src/domain/election/winner.ts';

const fixture = () => ({
  ele: '6258',
  t: '2',
  cdabr: 'br',
  dg: '25/10/2026',
  hg: '18:00:00',
  carg: [
    {
      cd: '1',
      agr: [
        {
          par: [
            {
              sg: 'TESTE',
              cand: [
                { n: '90', nmu: 'Candidato de teste A', vap: '60', pvap: '60,00', e: 'n', vs: [] },
                {
                  n: '91',
                  nmu: 'Candidato de teste B',
                  vap: '40',
                  pvap: '40,00',
                  e: 's',
                  vs: [{ nmu: 'Vice teste' }]
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  s: { st: '10', ts: '100', pst: '10,00' },
  v: { vv: '100', vb: '3', vn: '2' },
  e: { c: '105', a: '5' }
});
test('normaliza resultado, votos, vice e eleito sem inferir vitória pela liderança', () => {
  const result = parseResult(fixture(), 'BR');
  assert.equal(result.progress, 10);
  assert.equal(result.valid, 100);
  assert.equal(result.candidates[0].elected, false);
  assert.equal(result.candidates[1].elected, true);
  assert.equal(result.candidates[1].vice, 'Vice teste');
});
test('rejeita turno, eleição, abrangência e percentuais incorretos', () => {
  for (const patch of [
    { ele: '6257' },
    { t: '1' },
    { cdabr: 'sp' },
    { s: { st: '10', ts: '100', pst: '101,00' } }
  ])
    assert.throws(() => parseResult({ ...fixture(), ...patch }, 'BR'));
  assert.throws(() => parseResult({}, 'BR'));
  assert.throws(() => numeric('indisponível'));
  assert.throws(() => numeric('-10'));
});
test('zero votos é resultado válido e URL só aceita abrangências previstas', () => {
  const source = fixture();
  source.carg[0].agr[0].par[0].cand.forEach(c => {
    c.vap = '0';
    c.pvap = '0,00';
  });
  assert.equal(parseResult(source, 'BR').candidates[0].percent, 0);
  assert.match(resultUrl('SP'), /\/sp\/sp-c0001-e006258-u.json$/);
  assert.throws(() => resultUrl('../outro'));
});
test('vitória oficial antes de 100% aciona vencedor sem depender da liderança', () => {
  const result = parseResult(fixture(), 'BR');
  assert.equal(result.progress, 10);
  assert.equal(officialWinner(result.candidates), '91');
  assert.equal(officialWinner(result.candidates.map(c => ({ ...c, elected: false }))), undefined);
  assert.equal(officialWinner(result.candidates.map(c => ({ ...c, elected: true }))), undefined);
  assert.equal(officialWinner([]), undefined);
});

test('definição matemática nacional do TSE reconhece o líder e pode ser retirada', () => {
  const source = fixture();
  source.carg[0].agr[0].par[0].cand.forEach(c => { c.e = 'n'; });
  const defined = parseResult({ ...source, md: 'e' }, 'BR');
  assert.equal(officialWinner(defined.candidates), '90');
  for (const md of [undefined, 'n', 's', 'inválido'])
    assert.equal(officialWinner(parseResult({ ...source, md }, 'BR').candidates), undefined);
  assert.equal(officialWinner(parseResult({ ...source, cdabr: 'sp', md: 'e' }, 'SP').candidates), undefined);
  const tied = source.carg[0].agr[0].par[0].cand;
  tied[1].vap = tied[0].vap;
  assert.equal(officialWinner(parseResult({ ...source, md: 'e' }, 'BR').candidates), undefined);
});

test('indicação individual tem precedência sobre definição matemática', () => {
  assert.equal(officialWinner(parseResult({ ...fixture(), md: 'e' }, 'BR').candidates), '91');
  const candidates = parseResult(fixture(), 'BR').candidates;
  assert.equal(officialWinner(candidates.map(c => ({ ...c, elected: true })), true), undefined);
  assert.equal(officialWinner([ { ...candidates[0], elected: false } ], true), undefined);
});
