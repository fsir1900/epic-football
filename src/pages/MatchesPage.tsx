import { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { zhCN, enUS, es, fr, ja } from 'date-fns/locale';
import { fetchLocalMatches, fetchAllLocalMatchGroups } from '../services/localDataService';
import { fetchTodayMatches, getDemoMatches } from '../services/footballApi';
import MatchTable from '../components/match/MatchTable';
import UpgradeModal from '../components/membership/UpgradeModal';
import type { Match } from '../types';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import i18n from '../i18n';

const TABS = ['today', 'historical'] as const;
type Tab = (typeof TABS)[number];

// date-fns locale map
const LOCALE_MAP: Record<string, Locale> = {
  zh: zhCN, en: enUS, es, fr, ja, ar: enUS,
};
function getLocale() {
  return LOCALE_MAP[i18n.language] || enUS;
}

const PAGE_SIZE = 10; // matches per page in historical view

// Group date strings by month
function groupByMonth(groups: Array<{ date: string; matches: Match[] }>) {
  const months: Record<string, Array<{ date: string; matches: Match[] }>> = {};
  for (const g of groups) {
    const month = g.date.slice(0, 7); // "2026-03"
    if (!months[month]) months[month] = [];
    months[month].push(g);
  }
  return Object.entries(months).sort((a, b) => b[0].localeCompare(a[0]));
}

export default function MatchesPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  const [tab, setTab] = useState<Tab>('today');
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Today
  const [todayMatches, setTodayMatches] = useState<Match[]>([]);
  const [todayLoading, setTodayLoading] = useState(true);
  const [todaySource, setTodaySource] = useState<'local' | 'api' | 'demo'>('demo');

  // Historical
  const [histGroups, setHistGroups] = useState<Array<{ date: string; matches: Match[] }>>([]);
  const [histLoading, setHistLoading] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [histPage, setHistPage] = useState(1);

  // Load today
  useEffect(() => {
    async function load() {
      setTodayLoading(true);
      const local = await fetchLocalMatches();
      if (local.length > 0) {
        setTodayMatches(local);
        setTodaySource('local');
        setTodayLoading(false);
        return;
      }
      try {
        const data = await fetchTodayMatches();
        if (data.length > 0) {
          setTodayMatches(data);
          setTodaySource('api');
        } else {
          setTodayMatches(getDemoMatches().filter((m) => m.status !== 'FINISHED'));
          setTodaySource('demo');
        }
      } catch {
        setTodayMatches(getDemoMatches().filter((m) => m.status !== 'FINISHED'));
        setTodaySource('demo');
      } finally {
        setTodayLoading(false);
      }
    }
    load();
  }, []);

  // Load historical
  useEffect(() => {
    if (tab !== 'historical') return;
    async function load() {
      setHistLoading(true);
      const groups = await fetchAllLocalMatchGroups(30);
      if (groups.length > 0) {
        setHistGroups(groups);
        // Auto-expand latest month
        if (groups.length > 0) {
          const latestMonth = groups[0].date.slice(0, 7);
          setExpandedMonths(new Set([latestMonth]));
        }
      } else {
        const demos = getDemoMatches().filter((m) => m.status === 'FINISHED');
        const byDate: Record<string, Match[]> = {};
        demos.forEach((m) => {
          const d = m.date.slice(0, 10);
          if (!byDate[d]) byDate[d] = [];
          byDate[d].push(m);
        });
        const g = Object.entries(byDate)
          .sort((a, b) => b[0].localeCompare(a[0]))
          .map(([date, matches]) => ({ date, matches }));
        setHistGroups(g);
        if (g.length > 0) setExpandedMonths(new Set([g[0].date.slice(0, 7)]));
      }
      setHistLoading(false);
    }
    load();
  }, [tab]);

  // Grouped by month
  const monthGroups = useMemo(() => groupByMonth(histGroups), [histGroups]);

  // Flatten all matches for pagination
  const allHistMatches = useMemo(() => histGroups.flatMap((g) => g.matches), [histGroups]);
  const totalPages = Math.ceil(allHistMatches.length / PAGE_SIZE);

  // Today data for MatchTable (kept for potential future use)
  const _today = format(new Date(), 'yyyy-MM-dd');
  void _today;

  const toggleMonth = (month: string) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(month)) next.delete(month);
      else next.add(month);
      return next;
    });
  };

  const toggleDate = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  // For today tab: free access to first 2, rest locked
  const canViewMatch = (index: number) => {
    if (!isAuthenticated) return false;
    if (user?.isPro) return true;
    return index < 2;
  };

  return (
    <div className="min-h-screen bg-[#060b18] text-white pt-24 pb-0 px-4">
      <div className="max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{t('matches.title')}</h1>
            {tab === 'today' && (
              <span className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 ${
                todaySource === 'local' ? 'text-green-400 bg-green-900/20 border-green-700/30'
                : todaySource === 'api' ? 'text-blue-400 bg-blue-900/20 border-blue-700/30'
                : 'text-amber-400 bg-amber-900/20 border-amber-700/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block ${
                  todaySource === 'local' ? 'bg-green-400' : todaySource === 'api' ? 'bg-blue-400' : 'bg-amber-400'
                }`} />
                {todaySource === 'local' ? 'Expert Analysis' : todaySource === 'api' ? 'Live Data' : 'Demo'}
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map((t_) => (
            <button
              key={t_}
              onClick={() => setTab(t_)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                tab === t_ ? 'bg-blue-600 text-white' : 'bg-[#0d1829] text-gray-400 hover:text-white border border-[#1e3a5f]'
              }`}
            >
              {t_ === 'today' ? t('matches.today') : t('matches.historical')}
            </button>
          ))}
        </div>

        {/* ─── TODAY TAB ─── */}
        {tab === 'today' && (
          todayLoading ? (
            <div className="text-center py-20 text-gray-400">
              <div className="inline-block w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-3" />
              <div>{t('matches.loading')}</div>
            </div>
          ) : (
            <div>
              {/* Free notice */}
              <div className="mb-4 flex items-center gap-2 text-sm text-amber-400 bg-amber-900/20 border border-amber-700/30 px-4 py-2.5 rounded-xl">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t('matches.freeTip')}
              </div>

              {/* Table with lock logic */}
              <TodayTable
                matches={todayMatches}
                canViewFn={canViewMatch}
                isAuthenticated={isAuthenticated}
                onLockedClick={() => setShowUpgrade(true)}
                t={t}
              />
            </div>
          )
        )}

        {/* ─── HISTORICAL TAB ─── */}
        {tab === 'historical' && (
          histLoading ? (
            <div className="text-center py-20 text-gray-400">
              <div className="inline-block w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-3" />
              <div>Loading history...</div>
            </div>
          ) : monthGroups.length === 0 ? (
            <div className="text-gray-500 text-center py-16">{t('matches.noMatches')}</div>
          ) : (
            <div className="space-y-3">
              {monthGroups.map(([month, dateGroups]) => {
                const monthOpen = expandedMonths.has(month);
                const monthDate = new Date(month + '-01T12:00:00');
                const monthLabel = format(monthDate, 'yyyy MMMM', { locale: getLocale() });
                const totalInMonth = dateGroups.reduce((s, g) => s + g.matches.length, 0);

                return (
                  <div key={month} className="bg-[#0a1120] border border-[#1a2f50] rounded-2xl overflow-hidden">
                    {/* Month header */}
                    <button
                      onClick={() => toggleMonth(month)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#0d1829]/60 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full transition-colors ${monthOpen ? 'bg-blue-400' : 'bg-gray-600'}`} />
                        <span className="font-bold text-white text-base">{monthLabel}</span>
                        <span className="text-xs text-gray-500 bg-[#060b18] border border-[#1e3a5f] px-2 py-0.5 rounded-full">
                          {dateGroups.length} days · {totalInMonth} matches
                        </span>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform ${monthOpen ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Date list (inside month) */}
                    {monthOpen && (
                      <div className="border-t border-[#1a2f50] divide-y divide-[#1a2f50]/50">
                        {dateGroups.map(({ date, matches }) => {
                          const dateOpen = expandedDates.has(date);
                          const dateObj = new Date(date + 'T12:00:00');
                          const dateLabel = format(dateObj, 'MM/dd EEEE', { locale: getLocale() });
                          const winCount = matches.filter((m) => m.predictionCorrect === true).length;
                          const finishedCount = matches.filter((m) => m.status === 'FINISHED').length;

                          return (
                            <div key={date}>
                              {/* Date row */}
                              <button
                                onClick={() => toggleDate(date)}
                                className="w-full flex items-center justify-between px-6 py-3 hover:bg-[#0d1829]/40 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  <svg
                                    className={`w-3.5 h-3.5 text-gray-500 transition-transform shrink-0 ${dateOpen ? 'rotate-90' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  <span className="text-sm text-gray-300 font-medium">{dateLabel}</span>
                                  <span className="text-xs text-gray-600">{matches.length} matches</span>
                                </div>
                                {finishedCount > 0 && (
                                  <div className="flex items-center gap-3 text-xs">
                                    <span className="text-red-400 font-semibold">{winCount} WIN</span>
                                    <span className="text-gray-600">/ {finishedCount}</span>
                                    {finishedCount > 0 && (
                                      <span className="text-green-400 font-semibold">
                                        {((winCount / finishedCount) * 100).toFixed(0)}%
                                      </span>
                                    )}
                                  </div>
                                )}
                              </button>

                              {/* Match table for this date */}
                              {dateOpen && (
                                <div className="px-3 pb-3">
                                  <MatchTable
                                    dateGroups={[{ date, matches }]}
                                    onLockedClick={() => setShowUpgrade(true)}
                                    alwaysFree
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-4">
                  <button
                    onClick={() => setHistPage((p) => Math.max(1, p - 1))}
                    disabled={histPage === 1}
                    className="px-3 py-1.5 text-sm bg-[#0d1829] border border-[#1e3a5f] text-gray-400 hover:text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    ←
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setHistPage(p)}
                      className={`px-3 py-1.5 text-sm rounded-lg cursor-pointer transition-colors ${
                        p === histPage ? 'bg-blue-600 text-white' : 'bg-[#0d1829] border border-[#1e3a5f] text-gray-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setHistPage((p) => Math.min(totalPages, p + 1))}
                    disabled={histPage === totalPages}
                    className="px-3 py-1.5 text-sm bg-[#0d1829] border border-[#1e3a5f] text-gray-400 hover:text-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    →
                  </button>
                  <span className="text-xs text-gray-500 ml-2">{histPage} / {totalPages}</span>
                </div>
              )}
            </div>
          )
        )}
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}

// ─── Today inline table (with free/lock per row) ──────────────────────────────
interface TodayTableProps {
  matches: Match[];
  canViewFn: (i: number) => boolean;
  isAuthenticated: boolean;
  onLockedClick: () => void;
  t: (key: string) => string;
}

function TodayTable({ matches, canViewFn, isAuthenticated, onLockedClick, t }: TodayTableProps) {
  if (matches.length === 0) {
    return <div className="text-center py-16 text-gray-500">{t('matches.noMatches')}</div>;
  }

  return (
    <div className="bg-[#0a1120] border border-[#1a2f50] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-500 border-b border-[#1a2f50]">
              <th className="text-left px-4 py-3 font-medium w-8">#</th>
              <th className="text-left px-3 py-3 font-medium">League</th>
              <th className="text-left px-3 py-3 font-medium">Time</th>
              <th className="text-center px-3 py-3 font-medium min-w-[180px]">Home vs Away</th>
              <th className="text-center px-3 py-3 font-medium">Score</th>
              <th className="text-center px-3 py-3 font-medium">Prediction</th>
              <th className="text-left px-3 py-3 font-medium">Analysis</th>
              <th className="text-center px-3 py-3 font-medium">Status</th>
              <th className="text-center px-3 py-3 font-medium">Detail</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match, i) => {
              const matchTime = format(new Date(match.date), 'HH:mm');
              const viewable = canViewFn(i);
              const isFree = i < 2;
              const analysisText = match.h2h?.[0]?.home || '';
              const briefAnalysis = analysisText.split('|')[0].replace(/^(分析：|推荐：)/, '').trim();
              const recommendation = analysisText.split('|').find(p => p.includes('推荐'))?.replace('推荐：', '').trim() || '';
              const predLabel = { HOME: t('analysis.homeWin'), DRAW: t('analysis.draw'), AWAY: t('analysis.awayWin') }[match.prediction.predicted];

              return (
                <tr key={match.id} className={`border-b border-[#1a2f50]/60 last:border-0 transition-colors ${viewable ? 'hover:bg-[#0d1829]/60' : 'opacity-70'}`}>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{String(i + 1).padStart(2, '0')}</td>
                  <td className="px-3 py-3">
                    <span className="text-xs text-gray-400 bg-[#060b18] border border-[#1e3a5f] px-2 py-0.5 rounded whitespace-nowrap">{match.league}</span>
                  </td>
                  <td className="px-3 py-3 text-gray-400 text-xs tabular-nums whitespace-nowrap">{matchTime}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <span className="text-white font-medium text-sm">{match.homeTeam}</span>
                      <span className="text-gray-600 text-xs font-bold">vs</span>
                      <span className="text-white font-medium text-sm">{match.awayTeam}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center">
                    {match.score
                      ? <span className="text-white font-bold tabular-nums text-base">{match.score.home} : {match.score.away}</span>
                      : <span className="text-gray-600 text-sm">—</span>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {viewable ? (
                      match.predictionCorrect !== undefined && match.predictionCorrect !== null ? (
                        match.predictionCorrect
                          ? <span className="inline-flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">✓ WIN</span>
                          : <span className="inline-flex items-center gap-1 bg-gray-900 text-gray-400 text-xs font-bold px-2 py-0.5 rounded border border-gray-700">✗ FALSE</span>
                      ) : (
                        <span className="text-xs bg-blue-600/20 text-blue-300 border border-blue-600/30 px-2 py-0.5 rounded whitespace-nowrap">
                          {predLabel} {(match.prediction.confidence * 100).toFixed(0)}%
                        </span>
                      )
                    ) : (
                      <span className="text-gray-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-3 py-3 max-w-[220px]">
                    {viewable ? (
                      <div>
                        {briefAnalysis && <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">{briefAnalysis}</p>}
                        {recommendation && <p className="text-amber-400 text-xs mt-0.5 font-medium">→ {recommendation.split('，')[0]}</p>}
                      </div>
                    ) : (
                      <span className="text-gray-700 text-xs italic">
                        {isFree ? '' : t('matches.unlockToView')}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {match.status === 'LIVE' && <span className="text-red-400 text-xs font-semibold flex items-center gap-1 justify-center"><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />LIVE</span>}
                    {match.status === 'FINISHED' && <span className="text-gray-500 text-xs">FT</span>}
                    {match.status === 'UPCOMING' && <span className="text-blue-400 text-xs">Soon</span>}
                  </td>
                  <td className="px-3 py-3 text-center">
                    {viewable ? (
                      <Link
                        to={`/analysis/${match.id}`}
                        className="inline-block text-xs text-blue-400 hover:text-blue-300 border border-blue-600/40 hover:border-blue-500 bg-blue-600/10 hover:bg-blue-600/20 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                      >
                        {t('matches.viewAnalysis')}
                      </Link>
                    ) : isAuthenticated ? (
                      <button
                        onClick={onLockedClick}
                        className="text-xs text-amber-500 hover:text-amber-400 border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 mx-auto"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Pro
                      </button>
                    ) : (
                      <Link to="/register" className="inline-block text-xs text-gray-500 hover:text-white border border-gray-700/40 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap">
                        {t('nav.register')}
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Footer hint */}
      <div className="px-5 py-3 bg-[#060b18]/40 border-t border-[#1a2f50] flex items-center justify-between text-xs text-gray-500">
        <span>{t('matches.freeTip')}</span>
        <span>{matches.length} matches total</span>
      </div>
    </div>
  );
}
