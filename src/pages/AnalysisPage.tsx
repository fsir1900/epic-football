import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { getDemoMatches } from '../services/footballApi';
import { fetchLocalMatches } from '../services/localDataService';
import type { Match } from '../types';
import { useAuthStore } from '../store/authStore';

function StatBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-400 w-24 text-right">{label}</span>
      <div className="flex-1 h-2 bg-[#1e3a5f] rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        />
      </div>
      <span className="text-white w-8 tabular-nums">{value}</span>
    </div>
  );
}

function FormBadge({ result }: { result: string }) {
  const colors = { W: 'bg-green-600 text-white', D: 'bg-gray-600 text-white', L: 'bg-red-700 text-white' };
  return (
    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${colors[result as keyof typeof colors] || 'bg-gray-700 text-gray-300'}`}>
      {result}
    </span>
  );
}

export default function AnalysisPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { user, isAuthenticated, decrementFreeAnalyses } = useAuthStore();
  const [match, setMatch] = useState<Match | null>(null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // 先查本地数据，再用 demo
      const local = await fetchLocalMatches();
      const all = [...local, ...getDemoMatches()];
      const found = all.find((m) => m.id === id);
      setMatch(found || null);
      setLoading(false);
    }
    load();
  }, [id]);

  useEffect(() => {
    if (!match || !isAuthenticated) return;
    if (match.status === 'FINISHED') {
      setAccessGranted(true);
      return;
    }
    if (user?.isPro) {
      setAccessGranted(true);
      return;
    }
    const remaining = Math.max(0, (user?.freeAnalysesLimit || 2) - (user?.freeAnalysesUsed || 0));
    if (remaining > 0) {
      decrementFreeAnalyses();
      setAccessGranted(true);
    }
  }, [match, isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060b18] flex items-center justify-center">
        <div className="text-gray-400">{t('common.loading')}</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-[#060b18] flex items-center justify-center text-white">
        <div className="text-center">
          <p className="text-gray-400 mb-4">比赛不存在</p>
          <Link to="/matches" className="text-blue-400 hover:text-blue-300">{t('common.back')}</Link>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#060b18] flex items-center justify-center px-4 pt-16">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">需要登录</h2>
          <p className="text-gray-400 mb-6">注册即可获得2次免费分析</p>
          <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors">
            {t('nav.register')}
          </Link>
        </div>
      </div>
    );
  }

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-[#060b18] flex items-center justify-center px-4 pt-16">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">免费次数已用完</h2>
          <p className="text-gray-400 mb-6">升级 Pro 会员，每天无限查看比赛分析</p>
          <Link to="/pricing" className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 py-2 rounded-lg transition-colors">
            {t('membership.upgradeBtn')}
          </Link>
        </div>
      </div>
    );
  }

  const pred = match.prediction;
  const predLabels = [
    { key: 'HOME', label: t('analysis.homeWin'), value: pred.homeWin },
    { key: 'DRAW', label: t('analysis.draw'), value: pred.draw },
    { key: 'AWAY', label: t('analysis.awayWin'), value: pred.awayWin },
  ];

  return (
    <div className="min-h-screen bg-[#060b18] text-white pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back */}
        <Link to="/matches" className="flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('common.back')}
        </Link>

        {/* Match header */}
        <div className="bg-[#0d1829] border border-[#1e3a5f] rounded-2xl p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-400">{match.league}</span>
            <span className="text-sm text-gray-500">{format(new Date(match.date), 'yyyy-MM-dd HH:mm')}</span>
          </div>

          {/* Teams */}
          <div className="flex items-center justify-between gap-6 mb-6">
            <div className="flex-1 text-center">
              {match.homeLogo ? (
                <img src={match.homeLogo} alt={match.homeTeam} className="w-16 h-16 object-contain mx-auto mb-2" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-blue-800/40 flex items-center justify-center text-xl font-bold text-blue-300 mx-auto mb-2">
                  {match.homeTeam.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="font-bold text-white">{match.homeTeam}</div>
            </div>

            <div className="text-center min-w-[120px]">
              {match.score ? (
                <>
                  <div className="text-4xl font-black text-white tabular-nums mb-2">
                    {match.score.home} : {match.score.away}
                  </div>
                  {match.predictionCorrect !== undefined && (
                    <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-sm font-bold ${
                      match.predictionCorrect
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800 border border-gray-600 text-gray-300'
                    }`}>
                      {match.predictionCorrect ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                          WIN
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                          </svg>
                          MISS
                        </>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-3xl font-black text-gray-500 mb-2">VS</div>
              )}
            </div>

            <div className="flex-1 text-center">
              {match.awayLogo ? (
                <img src={match.awayLogo} alt={match.awayTeam} className="w-16 h-16 object-contain mx-auto mb-2" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-indigo-800/40 flex items-center justify-center text-xl font-bold text-indigo-300 mx-auto mb-2">
                  {match.awayTeam.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="font-bold text-white">{match.awayTeam}</div>
            </div>
          </div>
        </div>

        {/* Prediction probabilities */}
        <div className="bg-[#0d1829] border border-[#1e3a5f] rounded-2xl p-6 mb-4">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {t('analysis.prediction')}
          </h2>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {predLabels.map(({ key, label, value }) => (
              <div
                key={key}
                className={`rounded-xl p-4 text-center border transition-all ${
                  pred.predicted === key
                    ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500'
                    : 'bg-[#060b18] border-[#1e3a5f]'
                }`}
              >
                <div className="text-2xl font-black text-white">{(value * 100).toFixed(0)}%</div>
                <div className="text-xs text-gray-400 mt-1">{label}</div>
                {pred.predicted === key && (
                  <div className="mt-2 text-xs text-blue-400 font-medium">▲ {t('analysis.prediction')}</div>
                )}
              </div>
            ))}
          </div>

          {/* Confidence bar */}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-sm text-gray-400 w-20">{t('analysis.confidence')}</span>
            <div className="flex-1 h-2 bg-[#1e3a5f] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-700"
                style={{ width: `${(pred.confidence * 100).toFixed(0)}%` }}
              />
            </div>
            <span className="text-white font-bold tabular-nums">{(pred.confidence * 100).toFixed(0)}%</span>
          </div>

          {/* Score prediction */}
          {match.h2h && match.h2h[0]?.date !== '分析' && (() => {
            // Try to read score prediction from h2h field (legacy)
            return null;
          })()}
        </div>

        {/* Score Prediction Panel - shown when match is upcoming */}
        {match.status !== 'FINISHED' && (
          <div className="bg-[#0d1829] border border-[#1e3a5f] rounded-2xl p-6 mb-4">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI 比分预测
              <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full">Beta</span>
            </h2>
            <div className="flex flex-wrap gap-3">
              {/* Generate score predictions based on prediction probabilities */}
              {(() => {
                const p = match.prediction;
                const scores: { score: string; prob: number; type: string }[] = [];
                if (p.predicted === 'HOME') {
                  scores.push({ score: '2-0', prob: p.homeWin * 0.35, type: 'home' });
                  scores.push({ score: '2-1', prob: p.homeWin * 0.28, type: 'home' });
                  scores.push({ score: '1-0', prob: p.homeWin * 0.22, type: 'home' });
                  scores.push({ score: '3-1', prob: p.homeWin * 0.15, type: 'home' });
                } else if (p.predicted === 'AWAY') {
                  scores.push({ score: '0-2', prob: p.awayWin * 0.35, type: 'away' });
                  scores.push({ score: '1-2', prob: p.awayWin * 0.28, type: 'away' });
                  scores.push({ score: '0-1', prob: p.awayWin * 0.22, type: 'away' });
                  scores.push({ score: '1-3', prob: p.awayWin * 0.15, type: 'away' });
                } else {
                  scores.push({ score: '1-1', prob: p.draw * 0.45, type: 'draw' });
                  scores.push({ score: '0-0', prob: p.draw * 0.30, type: 'draw' });
                  scores.push({ score: '2-2', prob: p.draw * 0.25, type: 'draw' });
                }
                return scores.map((s, i) => (
                  <div key={i} className={`flex flex-col items-center px-5 py-3 rounded-xl border transition-all ${
                    i === 0
                      ? 'bg-blue-600/20 border-blue-500 ring-1 ring-blue-500'
                      : 'bg-[#060b18] border-[#1e3a5f]'
                  }`}>
                    <div className="text-xl font-black text-white tabular-nums">{s.score}</div>
                    <div className="text-xs text-gray-400 mt-1">{(s.prob * 100).toFixed(0)}%</div>
                    {i === 0 && <div className="text-xs text-blue-400 mt-1 font-medium">首选</div>}
                  </div>
                ));
              })()}
            </div>
            <p className="text-xs text-gray-600 mt-4">* 比分预测基于AI概率模型，仅供参考，不构成投注建议</p>
          </div>
        )}

        {/* Team stats */}
        {(match.homeStats || match.awayStats) && (
          <div className="bg-[#0d1829] border border-[#1e3a5f] rounded-2xl p-6 mb-4">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {t('analysis.stats')}
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Home stats */}
              {match.homeStats && (
                <div>
                  <div className="text-sm font-semibold text-blue-300 mb-3">{match.homeTeam}</div>
                  <div className="space-y-2">
                    <StatBar label={t('analysis.possession')} value={match.homeStats.possession} max={100} />
                    <StatBar label={t('analysis.shots')} value={match.homeStats.shots} max={20} />
                    <StatBar label={t('analysis.goals')} value={match.homeStats.goalsScored} max={5} />
                    <StatBar label={t('analysis.conceded')} value={match.homeStats.goalsConceded} max={5} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-gray-400">{t('analysis.form')}:</span>
                    <div className="flex gap-1">
                      {match.homeStats.form.map((r, i) => (
                        <FormBadge key={i} result={r} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Away stats */}
              {match.awayStats && (
                <div>
                  <div className="text-sm font-semibold text-indigo-300 mb-3">{match.awayTeam}</div>
                  <div className="space-y-2">
                    <StatBar label={t('analysis.possession')} value={match.awayStats.possession} max={100} />
                    <StatBar label={t('analysis.shots')} value={match.awayStats.shots} max={20} />
                    <StatBar label={t('analysis.goals')} value={match.awayStats.goalsScored} max={5} />
                    <StatBar label={t('analysis.conceded')} value={match.awayStats.goalsConceded} max={5} />
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-sm text-gray-400">{t('analysis.form')}:</span>
                    <div className="flex gap-1">
                      {match.awayStats.form.map((r, i) => (
                        <FormBadge key={i} result={r} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* H2H / 专家分析文字（本地数据） */}
        {match.h2h && match.h2h.length > 0 && match.h2h[0].date === '分析' ? (
          <div className="bg-[#0d1829] border border-[#1e3a5f] rounded-2xl p-6 mb-4">
            <h2 className="font-bold text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              专家分析
              <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full ml-1">人工</span>
            </h2>
            <div className="space-y-2">
              {match.h2h[0].home.split(' | ').map((line, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-300 leading-relaxed">
                  <span className="text-amber-500 mt-1 shrink-0">▸</span>
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>
        ) : match.h2h && match.h2h.length > 0 ? (
          <div className="bg-[#0d1829] border border-[#1e3a5f] rounded-2xl p-6">
            <h2 className="font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              {t('analysis.h2h')}
            </h2>
            <div className="space-y-2">
              {match.h2h.map((h, i) => (
                <div key={i} className="flex items-center gap-4 text-sm">
                  <span className="text-gray-500 w-20">{h.date}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <span className="text-white">{h.home}</span>
                    <span className="font-bold text-white bg-[#060b18] px-2 py-0.5 rounded tabular-nums">{h.score}</span>
                    <span className="text-white">{h.away}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
