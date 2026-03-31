import axios from 'axios';
import type { Match, MatchPrediction, PredictionResult } from '../types';
import { format, subDays } from 'date-fns';

// football-data.org free tier API
const API_BASE = 'https://api.football-data.org/v4';
// Free API key (publicly available demo key - limited calls)
const API_KEY = '6f55e58add124a27b71bc89782bb01c5';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'X-Auth-Token': API_KEY },
  timeout: 8000,
});

// Generate deterministic AI prediction based on match id
function generatePrediction(_homeTeam: string, _awayTeam: string, matchId: string): MatchPrediction {
  // Pseudo-random seeded by match id
  const seed = matchId.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const r = (n: number) => ((seed * 1103515245 + 12345 + n * 37) & 0x7fffffff) / 0x7fffffff;

  const hw = 0.3 + r(1) * 0.4;
  const d = 0.1 + r(2) * 0.25;
  const aw = 1 - hw - d > 0 ? 1 - hw - d : 0.1;
  const total = hw + d + aw;

  const homeWin = hw / total;
  const draw = d / total;
  const awayWin = aw / total;

  let predicted: PredictionResult = 'HOME';
  if (draw > homeWin && draw > awayWin) predicted = 'DRAW';
  else if (awayWin > homeWin) predicted = 'AWAY';

  const confidence = Math.max(homeWin, draw, awayWin);

  return { homeWin, draw, awayWin, predicted, confidence };
}

function isPredictionCorrect(prediction: MatchPrediction, homeGoals: number, awayGoals: number): boolean {
  if (homeGoals > awayGoals) return prediction.predicted === 'HOME';
  if (homeGoals < awayGoals) return prediction.predicted === 'AWAY';
  return prediction.predicted === 'DRAW';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformMatch(m: any): Match {
  const prediction = generatePrediction(m.homeTeam.name, m.awayTeam.name, String(m.id));
  const isFinished = m.status === 'FINISHED';
  const homeGoals = m.score?.fullTime?.home ?? null;
  const awayGoals = m.score?.fullTime?.away ?? null;

  return {
    id: String(m.id),
    homeTeam: m.homeTeam.name,
    awayTeam: m.awayTeam.name,
    homeLogo: m.homeTeam.crest,
    awayLogo: m.awayTeam.crest,
    league: m.competition?.name || 'Unknown League',
    leagueLogo: m.competition?.emblem,
    date: m.utcDate,
    status: m.status === 'IN_PLAY' || m.status === 'PAUSED' ? 'LIVE'
          : m.status === 'FINISHED' ? 'FINISHED'
          : 'UPCOMING',
    score: isFinished && homeGoals !== null ? { home: homeGoals, away: awayGoals } : undefined,
    prediction,
    predictionCorrect: isFinished && homeGoals !== null
      ? isPredictionCorrect(prediction, homeGoals, awayGoals)
      : undefined,
  };
}

// Fetch matches by date range from major competitions
export async function fetchMatchesByDate(date: string): Promise<Match[]> {
  try {
    // Premier League (PL), Champions League (CL), Bundesliga (BL1), LaLiga (PD)
    const competitions = ['PL', 'CL', 'BL1', 'PD', 'SA', 'FL1'];
    const results: Match[] = [];

    for (const comp of competitions.slice(0, 3)) {
      try {
        const res = await client.get(`/competitions/${comp}/matches`, {
          params: { dateFrom: date, dateTo: date, status: 'FINISHED,SCHEDULED,IN_PLAY' },
        });
        if (res.data?.matches) {
          results.push(...res.data.matches.map(transformMatch));
        }
      } catch {
        // skip failed competition
      }
    }

    return results;
  } catch {
    return [];
  }
}

export async function fetchTodayMatches(): Promise<Match[]> {
  const today = format(new Date(), 'yyyy-MM-dd');
  return fetchMatchesByDate(today);
}

export async function fetchRecentFinishedMatches(): Promise<Match[]> {
  const results: Match[] = [];
  for (let i = 1; i <= 7; i++) {
    const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
    const matches = await fetchMatchesByDate(date);
    results.push(...matches.filter((m) => m.status === 'FINISHED'));
  }
  return results;
}

// Demo data fallback
export function getDemoMatches(): Match[] {
  const teams = [
    { home: 'Manchester City', away: 'Arsenal', league: 'Premier League' },
    { home: 'Real Madrid', away: 'Barcelona', league: 'La Liga' },
    { home: 'Bayern Munich', away: 'Borussia Dortmund', league: 'Bundesliga' },
    { home: 'PSG', away: 'Marseille', league: 'Ligue 1' },
    { home: 'Inter Milan', away: 'AC Milan', league: 'Serie A' },
    { home: 'Liverpool', away: 'Chelsea', league: 'Premier League' },
    { home: 'Atletico Madrid', away: 'Sevilla', league: 'La Liga' },
    { home: 'Juventus', away: 'Roma', league: 'Serie A' },
    { home: 'Tottenham', away: 'Man United', league: 'Premier League' },
    { home: 'Bayer Leverkusen', away: 'RB Leipzig', league: 'Bundesliga' },
  ];

  const today = new Date();

  return teams.map((t, i) => {
    const matchDate = subDays(today, i - 2); // mix past/future
    const isPast = i >= 2;
    const pred = generatePrediction(t.home, t.away, String(i + 1000));
    const homeGoals = isPast ? Math.floor(Math.random() * 4) : undefined;
    const awayGoals = isPast ? Math.floor(Math.random() * 4) : undefined;

    return {
      id: String(i + 1000),
      homeTeam: t.home,
      awayTeam: t.away,
      league: t.league,
      date: matchDate.toISOString(),
      status: isPast ? 'FINISHED' : i === 2 ? 'LIVE' : 'UPCOMING',
      score: isPast ? { home: homeGoals!, away: awayGoals! } : undefined,
      prediction: pred,
      predictionCorrect: isPast
        ? isPredictionCorrect(pred, homeGoals!, awayGoals!)
        : undefined,
      homeStats: {
        possession: 45 + Math.floor(Math.random() * 20),
        shots: 8 + Math.floor(Math.random() * 10),
        goalsScored: 1 + Math.floor(Math.random() * 3),
        goalsConceded: Math.floor(Math.random() * 2),
        form: ['W', 'W', 'D', 'L', 'W'].sort(() => Math.random() - 0.5),
      },
      awayStats: {
        possession: 35 + Math.floor(Math.random() * 20),
        shots: 6 + Math.floor(Math.random() * 8),
        goalsScored: Math.floor(Math.random() * 3),
        goalsConceded: 1 + Math.floor(Math.random() * 2),
        form: ['W', 'D', 'L', 'W', 'D'].sort(() => Math.random() - 0.5),
      },
      h2h: [
        { date: '2025-10-15', home: t.home, away: t.away, score: '2-1' },
        { date: '2025-04-20', home: t.away, away: t.home, score: '0-0' },
        { date: '2024-11-05', home: t.home, away: t.away, score: '3-2' },
      ],
    };
  });
}
