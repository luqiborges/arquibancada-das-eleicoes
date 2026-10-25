import { useState } from 'react';

import type { Candidate } from '../domain/election/types';

export default function CandidateAvatar({ candidate }: {
  candidate: Candidate;
}) {
  const [failedUrl, setFailedUrl] = useState<string>();
  return <span className="avatar">
    {candidate.photoUrl && candidate.photoUrl !== failedUrl
      ? <img
        src={candidate.photoUrl}
        alt={`Foto de ${candidate.name}`}
        width={49}
        height={49}
        decoding="async"
        onError={() => setFailedUrl(candidate.photoUrl)}
      />
      : <span aria-label={candidate.name}>
        {candidate.name.split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('')}
      </span>}
  </span>;
}
