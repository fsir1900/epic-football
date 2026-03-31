export interface User {
  id: string;
  username: string;
  email: string;
  isPro: boolean;
  freeAnalysesUsed: number;
  freeAnalysesLimit: number;
}

export type PredictionResult = 'HOME' | 'DRAW' | 'AWAY';

export interface MatchPrediction {
  homeWin: number;      // probability 0-1
  draw: number;
  awayWin: number;
  predicted: PredictionResult;
  confidence: number;
}

export interface MatchScore {
  home: number;
  away: number;
}

export interface TeamStats {
  possession: number;
  shots: number;
  goalsScored: number;
  goalsConceded: number;
  form: string[]; // ['W','D','L',...]
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  league: string;
  leagueLogo?: string;
  date: string;          // ISO string
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  score?: MatchScore;
  prediction: MatchPrediction;
  predictionCorrect?: boolean; // null = not yet determined
  homeStats?: TeamStats;
  awayStats?: TeamStats;
  h2h?: { date: string; home: string; away: string; score: string }[];
}

export interface DayMatches {
  date: string;
  matches: Match[];
}
