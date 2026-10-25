import type { Candidate } from './types';

// The TSE election indicator is the trigger, irrespective of vote progress.
export function officialWinner(candidates: Candidate[]): string | undefined {
  const elected = candidates.filter(candidate => candidate.elected);
  return elected.length === 1 ? elected[0].number : undefined;
}
