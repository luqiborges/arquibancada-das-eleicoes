// Reference snapshot: TSE news bulletin, 05/10/2026, 99.99% counted.
export const FIRST_ROUND_SOURCE = 'https://www.tse.jus.br/comunicacao/noticias/2026/Outubro/flavio-bolsonaro-e-lula-vao-disputar-o-2o-turno-para-a-presidencia-da-republica';
export const FIRST_ROUND = [
  {
    number: '13',
    name: 'Lula',
    party: 'PT',
    votes: 53876617,
    photoUrl: 'https://resultados.tse.jus.br/oficial/ele2026/6258/fotos/br/280002542548.jpeg'
  },
  {
    number: '22',
    name: 'Flávio Bolsonaro',
    party: 'PL',
    votes: 56104268,
    photoUrl: 'https://resultados.tse.jus.br/oficial/ele2026/6258/fotos/br/280002551544.jpeg'
  },
] as const;
export const VOTES_PER_SEAT = 100000;
// 40% headroom over the largest reference vote, rounded up to 10 million.
export const STADIUM_CAPACITY = Math.ceil(Math.max(...FIRST_ROUND.map(c => c.votes)) * 1.4 / 10000000) * 10000000;
export const SEAT_COUNT = STADIUM_CAPACITY / VOTES_PER_SEAT;

export function occupancy(votes: number) {
  if (!Number.isSafeInteger(votes) || votes < 0)
    throw new Error('Votos inválidos.');
  return {
    filled: Math.min(SEAT_COUNT, Math.floor(votes / VOTES_PER_SEAT)),
    remainder: votes % VOTES_PER_SEAT,
    overflow: Math.max(0, votes - STADIUM_CAPACITY)
  };
}
