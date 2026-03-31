import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useState } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0e1a]/95 backdrop-blur border-b border-[#1e3a5f]">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="15" stroke="#3b82f6" strokeWidth="2"/>
            <path d="M16 4 L28 12 L28 20 L16 28 L4 20 L4 12 Z" fill="#1e3a8a" stroke="#3b82f6" strokeWidth="1.5"/>
            <circle cx="16" cy="16" r="5" fill="#3b82f6"/>
            <path d="M16 11 L18 14 L22 14.5 L19 17.5 L19.5 21.5 L16 19.5 L12.5 21.5 L13 17.5 L10 14.5 L14 14 Z" fill="white"/>
          </svg>
          <span className="text-white">Football<span className="text-blue-400">Pro</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {[
            { to: '/', label: t('nav.home') },
            { to: '/matches', label: t('nav.matches') },
            { to: '/pricing', label: t('nav.pricing') },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-medium transition-colors ${
                location.pathname === to
                  ? 'text-blue-400'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <div className="relative">
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1 text-sm text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            >
              <span>{currentLang.flag}</span>
              <span className="hidden sm:inline">{currentLang.label}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-1 bg-[#0d1829] border border-[#1e3a5f] rounded-lg shadow-xl py-1 min-w-[140px]">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { i18n.changeLanguage(lang.code); setLangOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-blue-600/20 transition-colors cursor-pointer ${
                      lang.code === i18n.language ? 'text-blue-400' : 'text-gray-300'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-2">
              {!user?.isPro && (
                <Link
                  to="/pricing"
                  className="hidden sm:flex items-center gap-1 bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer"
                >
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  {t('nav.upgrade')}
                </Link>
              )}
              {user?.isPro && (
                <span className="hidden sm:inline text-xs bg-blue-600/30 text-blue-300 border border-blue-600/50 px-2 py-0.5 rounded-full font-bold">PRO</span>
              )}
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-full px-3 py-1.5 transition-colors cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold text-white">
                    {user?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-sm text-white hidden sm:inline">{user?.username}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-1 bg-[#0d1829] border border-[#1e3a5f] rounded-lg shadow-xl py-1 min-w-[160px]">
                    <div className="px-4 py-2 border-b border-[#1e3a5f]">
                      <div className="text-sm font-medium text-white">{user?.username}</div>
                      <div className="text-xs text-gray-400">{user?.email}</div>
                    </div>
                    {!user?.isPro && (
                      <div className="px-4 py-2 text-xs text-amber-400">
                        {t('matches.freeRemaining')}: {Math.max(0, (user?.freeAnalysesLimit || 2) - (user?.freeAnalysesUsed || 0))}
                      </div>
                    )}
                    <button
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                    >
                      {t('nav.logout')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm text-gray-300 hover:text-white transition-colors px-3 py-1.5"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
