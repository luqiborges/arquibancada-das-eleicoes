import { states } from '../data/states.ts';
import type { Result } from '../domain/election/types';
import { officialWinner } from '../domain/election/winner.ts';

interface RawCandidate {
  n: string;
  sqcand?: string;
  nmu: string;
  vap: string;
  pvap: string;
  e: string;
  vs?: {
    nmu: string;
  }[];
}

interface RawResult {
  ele: string;
  t: string;
  md?: string;
  cdabr: string;
  dg: string;
  hg: string;
  carg: {
    cd: string;
    agr: {
      par: {
        sg: string;
        cand: RawCandidate[];
      }[];
    }[];
  }[];
  s: {
    st: string;
    ts: string;
    pst: string;
  };
  v: {
    vv: string;
    vb: string;
    vn: string;
  };
  e: {
    c: string;
    a: string;
  };
}

export const numeric = (value: unknown): number => {
  const number = Number(String(value ?? '').replace(',', '.'));
  if (!Number.isFinite(number) || number < 0)
    throw new Error('Valor inválido no arquivo do TSE.');
  return number;
};

export function parseResult(input: unknown, uf: string): Result {
  const raw = input as RawResult;
  if (raw?.ele !== '6258' || raw.t !== '2' || raw.cdabr?.toLowerCase() !== uf.toLowerCase() || !raw.s || !raw.v || !raw.e || !Array.isArray(raw.carg))
    throw new Error('O arquivo não corresponde ao segundo turno presidencial de 2026.');
  const office = raw.carg.find(c => c.cd === '1');
  if (!office || !Array.isArray(office.agr))
    throw new Error('Resultado presidencial indisponível.');
  const candidates = office.agr.flatMap(group => group.par.flatMap(party => party.cand.map(c => ({
    number: c.n,
    name: c.nmu,
    party: party.sg,
    vice: c.vs?.[0]?.nmu ?? '',
    votes: numeric(c.vap),
    percent: numeric(c.pvap),
    elected: c.e === 's',
    photoUrl: c.sqcand && /^\d+$/.test(c.sqcand) ? `https://resultados.tse.jus.br/oficial/ele2026/6258/fotos/br/${c.sqcand}.jpeg` : undefined
  }))));
  if (!candidates.length || candidates.some(c => !c.name || !c.number || c.percent > 100))
    throw new Error('Candidaturas indisponíveis ou inválidas.');
  const mathematicalWinner = officialWinner(candidates, raw.cdabr.toLowerCase() === 'br' && raw.md === 'e');
  if (mathematicalWinner)
    candidates.forEach(candidate => {
      candidate.elected = candidate.number === mathematicalWinner;
    });
  const progress = numeric(raw.s.pst);
  if (progress > 100)
    throw new Error('Percentual de seções inválido.');
  return {
    uf: uf.toUpperCase(),
    generated: `${raw.dg} às ${raw.hg}`,
    counted: numeric(raw.s.st),
    total: numeric(raw.s.ts),
    progress,
    valid: numeric(raw.v.vv),
    blank: numeric(raw.v.vb),
    nullVotes: numeric(raw.v.vn),
    turnout: numeric(raw.e.c),
    absent: numeric(raw.e.a),
    candidates: candidates.sort((a, b) => b.votes - a.votes || a.number.localeCompare(b.number))
  };
}

export function resultUrl(uf: string) {
  if (uf !== 'BR' && !states.some(s => s[0] === uf))
    throw new Error('UF inválida.');
  const code = uf.toLowerCase();
  return `https://resultados.tse.jus.br/oficial/ele2026/6258/dados/${code}/${code}-c0001-e006258-u.json`;
}

export async function fetchResult(uf: string, signal?: AbortSignal): Promise<Result> {
  const response = await fetch(resultUrl(uf), { signal, cache: 'no-cache' });
  if (!response.ok)
    throw new Error(response.status === 404 ? 'O TSE ainda não disponibilizou este resultado.' : `O TSE respondeu com erro ${response.status}.`);
  return parseResult(await response.json(), uf);
}
