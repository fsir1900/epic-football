import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from 'react-i18next';
import type { Match } from '../../types';

interface MatchTableProps {
  dateGroups: Array<{ date: string; matches: Match[] }>;
  onLockedClick?: () => void;
  alwaysFree?: boolean;
}

function PredLabel({ match }: { match: Match }) {
  const { t } = useTranslation();
  if (match.status === 'FINISHED' && match.predictionCorrect !== undefined) {
    return match.predictionCorrect ? (
      <span className="inline-flex items-center gap-1 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
        </svg>
        WIN
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 bg-gray-900 text-gray-400 text-xs font-bold px-2 py-0.5 rounded border border-gray-700">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
        MISS
      </span>
    );
  }

  const predLabel = {
    HOME: t('analysis.homeWin'),
    DRAW: t('analysis.draw'),
    AWAY: t('analysis.awayWin'),
  }[match.prediction.predicted];

  const conf = (match.prediction.confidence * 100).toFixed(0);
  return (
    <span className="text-xs bg-blue-600/20 text-blue-300 border border-blue-600/30 px-2 py-0.5 rounded whitespace-nowrap">
      {predLabel} {conf}%
    </span>
  );
}

function StatusDot({ status }: { status: Match['status'] }) {
  if (status === 'LIVE') return (
    <span className="inline-flex items-center gap-1 text-red-400 text-xs font-semibold">
      <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
      LIVE
    </span>
  );
  if (status === 'FINISHED') return (
    <span className="text-gray-500 text-xs">完场</span>
  );
  return <span className="text-blue-400 text-xs">未开</span>;
}

export default function MatchTable({ dateGroups, onLockedClick, alwaysFree }: MatchTableProps) {
  const { user, isAuthenticated } = useAuthStore();
  const { t } = useTranslation();

  const canView = (match: Match, indexInDay: number) => {
    if (alwaysFree) return true; // historical: always free
    if (!isAuthenticated) return false;
    if (match.status === 'FINISHED') return true;
    if (user?.isPro) return true;
    const freeRemaining = Math.max(0, (user?.freeAnalysesLimit || 2) - (user?.freeAnalysesUsed || 0));
    return indexInDay < 2 || freeRemaining > 0;
  };

  if (dateGroups.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">暂无比赛数据</div>
    );
  }

  return (
    <div className="space-y-8">
      {dateGroups.map(({ date, matches }) => {
        const dateObj = new Date(date + 'T12:00:00');
        const dateLabel = format(dateObj, 'MM月dd日 EEEE', { locale: zhCN });
        const winCount = matches.filter(m => m.predictionCorrect === true).length;
        const finishedCount = matches.filter(m => m.status === 'FINISHED').length;

        return (
          <div key={date} className="bg-[#0a1120] border border-[#1a2f50] rounded-2xl overflow-hidden">
            {/* Date Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#0d1829] border-b border-[#1a2f50]">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 rounded-full bg-blue-500" />
                <span className="font-bold text-white text-base">{dateLabel}</span>
                <span className="text-xs text-gray-500 bg-[#060b18] border border-[#1e3a5f] px-2 py-0.5 rounded-full">
                  {matches.length} 场
                </span>
              </div>
              {finishedCount > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>命中 <span className="text-green-400 font-bold">{winCount}</span> / {finishedCount}</span>
                </div>
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 border-b border-[#1a2f50]">
                    <th className="text-left px-4 py-2.5 font-medium w-8">#</th>
                    <th className="text-left px-3 py-2.5 font-medium">联赛</th>
                    <th className="text-left px-3 py-2.5 font-medium">时间</th>
                    <th className="text-center px-3 py-2.5 font-medium min-w-[180px]">主队 vs 客队</th>
                    <th className="text-center px-3 py-2.5 font-medium">比分</th>
                    <th className="text-center px-3 py-2.5 font-medium">预测</th>
                    <th className="text-left px-3 py-2.5 font-medium">分析摘要</th>
                    <th className="text-center px-3 py-2.5 font-medium">状态</th>
                    <th className="text-center px-3 py-2.5 font-medium">详情</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match, i) => {
                    const matchTime = format(new Date(match.date), 'HH:mm');
                    const analysisText = match.h2h?.[0]?.home || '';
                    // Extract first brief sentence
                    const briefAnalysis = analysisText.split('|')[0].replace(/^(分析：|推荐：)/, '').trim();
                    const recommendation = analysisText.split('|').find(p => p.includes('推荐'))?.replace('推荐：', '').trim() || '';
                    const viewable = canView(match, i);

                    return (
                      <tr
                        key={match.id}
                        className="border-b border-[#1a2f50]/60 last:border-0 hover:bg-[#0d1829]/60 transition-colors group"
                      >
                        {/* No */}
                        <td className="px-4 py-3 text-gray-600 font-mono text-xs">{String(i + 1).padStart(2, '0')}</td>

                        {/* League */}
                        <td className="px-3 py-3">
                          <span className="text-xs text-gray-400 bg-[#060b18] border border-[#1e3a5f] px-2 py-0.5 rounded whitespace-nowrap">
                            {match.league}
                          </span>
                        </td>

                        {/* Time */}
                        <td className="px-3 py-3 text-gray-400 text-xs tabular-nums whitespace-nowrap">{matchTime}</td>

                        {/* Teams */}
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                            <span className="text-white font-medium text-sm">{match.homeTeam}</span>
                            <span className="text-gray-600 text-xs font-bold">vs</span>
                            <span className="text-white font-medium text-sm">{match.awayTeam}</span>
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-3 py-3 text-center">
                          {match.score ? (
                            <span className="text-white font-bold tabular-nums text-base">
                              {match.score.home} : {match.score.away}
                            </span>
                          ) : (
                            <span className="text-gray-600 text-sm">—</span>
                          )}
                        </td>

                        {/* Prediction */}
                        <td className="px-3 py-3 text-center">
                          <PredLabel match={match} />
                        </td>

                        {/* Analysis brief */}
                        <td className="px-3 py-3 max-w-[240px]">
                          {viewable ? (
                            <div>
                              {briefAnalysis && (
                                <p className="text-gray-300 text-xs leading-relaxed line-clamp-2">{briefAnalysis}</p>
                              )}
                              {recommendation && (
                                <p className="text-amber-400 text-xs mt-0.5 font-medium">
                                  推荐: {recommendation.split('，')[0]}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-600 text-xs italic">登录后查看</span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3 text-center">
                          <StatusDot status={match.status} />
                        </td>

                        {/* Action */}
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
                              className="text-xs text-amber-500 hover:text-amber-400 border border-amber-600/30 bg-amber-500/10 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap"
                            >
                              🔒 升级解锁
                            </button>
                          ) : (
                            <Link
                              to="/register"
                              className="inline-block text-xs text-gray-400 hover:text-white border border-gray-600/40 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                            >
                              注册查看
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer stats */}
            <div className="px-5 py-3 bg-[#060b18]/40 border-t border-[#1a2f50] flex gap-6 text-xs text-gray-500">
              <span>
                主胜 <span className="text-blue-400 font-semibold">
                  {matches.filter(m => m.prediction.predicted === 'HOME').length}
                </span> 场
              </span>
              <span>
                平局 <span className="text-gray-400 font-semibold">
                  {matches.filter(m => m.prediction.predicted === 'DRAW').length}
                </span> 场
              </span>
              <span>
                客胜 <span className="text-indigo-400 font-semibold">
                  {matches.filter(m => m.prediction.predicted === 'AWAY').length}
                </span> 场
              </span>
              {finishedCount > 0 && (
                <span className="ml-auto">
                  准确率 <span className="text-green-400 font-semibold">
                    {finishedCount > 0 ? ((winCount / finishedCount) * 100).toFixed(0) : 0}%
                  </span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
