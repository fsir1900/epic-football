import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import type { Match } from '../../types';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface MatchCardProps {
  match: Match;
  index: number;
  onLockedClick?: () => void;
}

function StatusBadge({ status }: { status: Match['status'] }) {
  const { t } = useTranslation();
  const map = {
    LIVE: { label: t('matches.live'), cls: 'bg-red-600 text-white animate-pulse' },
    UPCOMING: { label: t('matches.upcoming'), cls: 'bg-blue-600/30 text-blue-300' },
    FINISHED: { label: t('matches.finished'), cls: 'bg-gray-600/30 text-gray-400' },
  };
  const { label, cls } = map[status];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>{label}</span>
  );
}

function PredictionBadge({ match }: { match: Match }) {
  const { t } = useTranslation();

  if (match.status === 'FINISHED' && match.predictionCorrect !== undefined) {
    return match.predictionCorrect ? (
      <span className="inline-flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
        </svg>
        {t('matches.win')}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 bg-gray-800 text-gray-300 text-xs font-bold px-2 py-0.5 rounded border border-gray-600">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
        </svg>
        {t('matches.false')}
      </span>
    );
  }

  const predLabel = {
    HOME: t('analysis.homeWin'),
    DRAW: t('analysis.draw'),
    AWAY: t('analysis.awayWin'),
  }[match.prediction.predicted];

  return (
    <span className="text-xs bg-blue-600/20 text-blue-300 border border-blue-600/30 px-2 py-0.5 rounded">
      {predLabel} {(match.prediction.confidence * 100).toFixed(0)}%
    </span>
  );
}

export default function MatchCard({ match, index, onLockedClick }: MatchCardProps) {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();

  const freeRemaining = isAuthenticated
    ? Math.max(0, (user?.freeAnalysesLimit || 2) - (user?.freeAnalysesUsed || 0))
    : 0;

  // Historical (FINISHED) matches are always free to view
  // Today's matches: free users get 2; pro users unlimited
  const canView = (() => {
    if (!isAuthenticated) return false;
    if (match.status === 'FINISHED') return true; // always free for historical
    if (user?.isPro) return true;
    return index < 2 || freeRemaining > 0;
  })();

  const matchDate = new Date(match.date);

  return (
    <div className="bg-[#0d1829] border border-[#1e3a5f] rounded-xl overflow-hidden hover:border-blue-500/50 transition-all duration-200 group">
      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{match.league}</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={match.status} />
          <span className="text-xs text-gray-500">
            {format(matchDate, 'MM/dd HH:mm')}
          </span>
        </div>
      </div>

      {/* Teams & Score */}
      <div className="px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Home team */}
          <div className="flex-1 flex flex-col items-center gap-1">
            {match.homeLogo ? (
              <img src={match.homeLogo} alt={match.homeTeam} className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-800/40 flex items-center justify-center text-sm font-bold text-blue-300">
                {match.homeTeam.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-white text-center leading-tight">{match.homeTeam}</span>
          </div>

          {/* Score / VS */}
          <div className="flex flex-col items-center gap-1 min-w-[80px]">
            {match.score ? (
              <div className="text-2xl font-bold text-white tabular-nums">
                {match.score.home}
                <span className="text-gray-500 mx-1">:</span>
                {match.score.away}
              </div>
            ) : (
              <div className="text-xl font-bold text-gray-500">VS</div>
            )}
            <PredictionBadge match={match} />
          </div>

          {/* Away team */}
          <div className="flex-1 flex flex-col items-center gap-1">
            {match.awayLogo ? (
              <img src={match.awayLogo} alt={match.awayTeam} className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-800/40 flex items-center justify-center text-sm font-bold text-indigo-300">
                {match.awayTeam.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium text-white text-center leading-tight">{match.awayTeam}</span>
          </div>
        </div>
      </div>

      {/* Prediction probabilities */}
      <div className="px-4 pb-3">
        <div className="flex gap-1 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-blue-500 transition-all"
            style={{ width: `${(match.prediction.homeWin * 100).toFixed(0)}%` }}
          />
          <div
            className="bg-gray-500 transition-all"
            style={{ width: `${(match.prediction.draw * 100).toFixed(0)}%` }}
          />
          <div
            className="bg-indigo-500 transition-all"
            style={{ width: `${(match.prediction.awayWin * 100).toFixed(0)}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>{(match.prediction.homeWin * 100).toFixed(0)}%</span>
          <span>{(match.prediction.draw * 100).toFixed(0)}%</span>
          <span>{(match.prediction.awayWin * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Action */}
      <div className="px-4 pb-4">
        {canView ? (
          <Link
            to={`/analysis/${match.id}`}
            className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition-colors cursor-pointer"
          >
            {t('matches.viewAnalysis')}
          </Link>
        ) : isAuthenticated ? (
          <button
            onClick={onLockedClick}
            className="w-full flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-400 text-sm font-medium py-2 rounded-lg transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {t('matches.locked')}
          </button>
        ) : (
          <Link
            to="/register"
            className="block w-full text-center bg-blue-600/20 border border-blue-600/40 hover:bg-blue-600/30 text-blue-300 text-sm font-medium py-2 rounded-lg transition-colors cursor-pointer"
          >
            {t('nav.register')} →
          </Link>
        )}
      </div>
    </div>
  );
}
