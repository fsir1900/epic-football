import type { Match } from '../types';
import { format, subDays } from 'date-fns';

interface LocalMatchData {
  date: string;
  generatedAt: string;
  sourceFile: string;
  matchCount: number;
  matches: LocalMatch[];
}

interface LocalMatch {
  id: string;
  num: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  date: string;
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';
  prediction: {
    homeWin: number;
    draw: number;
    awayWin: number;
    predicted: 'HOME' | 'DRAW' | 'AWAY';
    confidence: number;
  };
  score: { home: number; away: number } | null;
  predictionCorrect: boolean | null;
  primaryScorePrediction: string | null;
  allScorePredictions: string[];
  analysisText: string;
  source: 'manual';
}

/**
 * 从 public/data/matches_YYYY-MM-DD.json 加载当天手动分析数据
 */
export async function fetchLocalMatches(date?: string): Promise<Match[]> {
  const targetDate = date || format(new Date(), 'yyyy-MM-dd');

  try {
    const res = await fetch(`/data/matches_${targetDate}.json?t=${Date.now()}`);
    if (!res.ok) return [];

    const data: LocalMatchData = await res.json();
    return data.matches.map(normalizeLocalMatch);
  } catch {
    return [];
  }
}

/**
 * 将本地格式转换为网站 Match 类型
 */
function normalizeLocalMatch(m: LocalMatch): Match {
  return {
    id: m.id,
    homeTeam: m.homeTeam,
    awayTeam: m.awayTeam,
    league: m.league,
    date: m.date,
    status: m.status,
    score: m.score || undefined,
    prediction: m.prediction,
    predictionCorrect: m.predictionCorrect ?? undefined,
    // 把分析文字存到 h2h 字段作为展示（复用现有结构）
    h2h: m.analysisText
      ? [{ date: '分析', home: m.analysisText, away: '', score: '' }]
      : undefined,
    homeStats: undefined,
    awayStats: undefined,
  };
}

/**
 * 检测当天是否有本地数据
 */
export async function hasLocalMatchesForToday(): Promise<boolean> {
  const today = format(new Date(), 'yyyy-MM-dd');
  try {
    const res = await fetch(`/data/matches_${today}.json`, { method: 'HEAD' });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * 扫描过去 N 天（含今天）的所有本地数据文件，返回按日期分组的结果
 */
export async function fetchAllLocalMatchGroups(
  daysBack = 30
): Promise<Array<{ date: string; matches: Match[] }>> {
  const today = new Date();
  const dateList: string[] = [];
  for (let i = 0; i <= daysBack; i++) {
    dateList.push(format(subDays(today, i), 'yyyy-MM-dd'));
  }

  const results = await Promise.all(
    dateList.map(async (date) => {
      const matches = await fetchLocalMatches(date);
      return { date, matches };
    })
  );

  // 只保留有数据的日期，从新到旧排列
  return results
    .filter((r) => r.matches.length > 0)
    .sort((a, b) => b.date.localeCompare(a.date));
}
