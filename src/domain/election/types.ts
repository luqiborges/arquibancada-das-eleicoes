export interface Candidate {
  number: string;
  name: string;
  party: string;
  vice: string;
  votes: number;
  percent: number;
  elected: boolean;
  photoUrl?: string;
}

export interface Result {
  uf: string;
  generated: string;
  counted: number;
  total: number;
  progress: number;
  valid: number;
  blank: number;
  nullVotes: number;
  turnout: number;
  absent: number;
  candidates: Candidate[];
}
