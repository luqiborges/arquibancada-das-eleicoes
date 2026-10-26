import type { Candidate } from './types';

// Mathematical definition is supplied by the TSE, never inferred from progress.
export function officialWinner(candidates: Candidate[], mathematicallyDefined = false): string | undefined {
  const elected = candidates.filter(candidate => candidate.elected);
  if (elected.length > 0)
    return elected.length === 1 ? elected[0].number : undefined;
  if (!mathematicallyDefined || candidates.length !== 2)
    return undefined;
  const [first, second] = [...candidates].sort((a, b) => b.votes - a.votes);
  return first.votes > second.votes ? first.number : undefined;
}
