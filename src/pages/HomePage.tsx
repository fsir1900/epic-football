import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import UpgradeModal from '../components/membership/UpgradeModal';
import { fetchAllLocalMatchGroups } from '../services/localDataService';

export default function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [accuracyStats, setAccuracyStats] = useState({ accuracy: '74.3%', total: '50+', days: '20+' });

  useEffect(() => {
    async function calcStats() {
      try {
        const groups = await fetchAllLocalMatchGroups(30);
        if (groups.length === 0) return;
        let correct = 0, total = 0;
        for (const g of groups) {
          for (const m of g.matches) {
            if (m.status === 'FINISHED' && m.predictionCorrect !== undefined) {
              total++;
              if (m.predictionCorrect) correct++;
            }
          }
        }
        if (total > 0) {
          const pct = ((correct / total) * 100).toFixed(1);
          const totalMatches = groups.reduce((s, g) => s + g.matches.length, 0);
          setAccuracyStats({
            accuracy: `${pct}%`,
            total: `${totalMatches}+`,
            days: `${groups.length}`,
          });
        }
      } catch {
        // keep defaults
      }
    }
    calcStats();
  }, []);

  const stats = [
    { labelKey: accuracyStats.accuracy, descKey: 'AI Accuracy' },
    { labelKey: '20+', descKey: 'Leagues Covered' },
    { labelKey: accuracyStats.total, descKey: 'Total Analyses' },
    { labelKey: '12,000+', descKey: 'Active Users' },
  ];

  const features = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      titleKey: 'AI Analysis',
      descKey: t('hero.subtitle'),
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      titleKey: 'Real-Time Results',
      descKey: 'WIN / FALSE marks after every match',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
        </svg>
      ),
      titleKey: t('common.selectLanguage'),
      descKey: 'English · Español · Français · 日本語 · العربية · 中文',
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      titleKey: t('matches.historical'),
      descKey: 'Free forever · archived by date',
    },
  ];

  return (
    <div className="min-h-screen bg-[#060b18] text-white">
      {/* Hero */}
      <div className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%231e3a5f%22%20fill-opacity%3D%220.3%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-20" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-600/20 border border-blue-600/40 text-blue-300 text-sm px-4 py-1.5 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            {t('matches.live')} · Premier League · Real Madrid vs Barcelona
          </div>

          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6 text-white">
            {t('hero.title')}
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            {t('hero.subtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg transition-colors shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  {t('hero.cta')}
                </Link>
                <button
                  onClick={() => setShowUpgrade(true)}
                  className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-lg transition-colors shadow-lg shadow-amber-500/30 cursor-pointer"
                >
                  {t('hero.ctaPro')}
                </button>
              </>
            ) : (
              <Link
                to="/matches"
                className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-lg transition-colors cursor-pointer"
              >
                {t('nav.matches')} →
              </Link>
            )}
          </div>

          {!isAuthenticated && (
            <p className="mt-4 text-sm text-amber-400">{t('auth.freeGift')}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.labelKey} className="bg-[#0d1829] border border-[#1e3a5f] rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-white mb-1">{s.labelKey}</div>
            <div className="text-xs text-gray-400">{s.descKey}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center text-white mb-8">Why FootballPro?</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {features.map((f, i) => (
            <div key={i} className="bg-[#0d1829] border border-[#1e3a5f] rounded-xl p-6 flex gap-4">
              <div className="text-blue-400 mt-1 shrink-0">{f.icon}</div>
              <div>
                <h3 className="font-semibold text-white mb-1">{f.titleKey}</h3>
                <p className="text-sm text-gray-400">{f.descKey}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing teaser */}
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-blue-900 to-[#0d1829] border border-blue-700/40 rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-2xl md:text-3xl font-black text-white mb-2 relative">
            {t('auth.freeGift')}
          </h2>
          <p className="text-blue-200 mb-6 relative text-sm">{t('matches.freeTip')}</p>
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/register"
                className="inline-block bg-white hover:bg-gray-100 text-blue-800 font-bold px-8 py-3 rounded-xl transition-colors cursor-pointer"
              >
                {t('hero.cta')}
              </Link>
              <button
                onClick={() => setShowUpgrade(true)}
                className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3 rounded-xl transition-colors cursor-pointer"
              >
                {t('membership.upgradeBtn')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowUpgrade(true)}
              className="inline-block bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3 rounded-xl transition-colors cursor-pointer"
            >
              {t('membership.upgradeBtn')}
            </button>
          )}
        </div>
      </div>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </div>
  );
}
