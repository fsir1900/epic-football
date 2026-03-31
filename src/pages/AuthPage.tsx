import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function AuthPage({ mode }: { mode: 'login' | 'register' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, register } = useAuthStore();

  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const ok = await login(form.email, form.password);
        if (ok) navigate('/matches');
        else setError(mode === 'login' ? '邮箱或密码错误' : '注册失败');
      } else {
        if (!form.username.trim()) { setError('请输入用户名'); return; }
        const ok = await register(form.username, form.email, form.password);
        if (ok) navigate('/matches');
        else setError('该邮箱已注册');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#060b18] flex items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 font-bold text-2xl text-white">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="#3b82f6" strokeWidth="2"/>
              <circle cx="16" cy="16" r="5" fill="#3b82f6"/>
              <path d="M16 11 L18 14 L22 14.5 L19 17.5 L19.5 21.5 L16 19.5 L12.5 21.5 L13 17.5 L10 14.5 L14 14 Z" fill="white"/>
            </svg>
            Football<span className="text-blue-400">Pro</span>
          </Link>
        </div>

        <div className="bg-[#0d1829] border border-[#1e3a5f] rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">
            {mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
          </h1>

          {mode === 'register' && (
            <p className="text-amber-400 text-sm mb-6">{t('auth.freeGift')}</p>
          )}
          {mode === 'login' && <div className="mb-6" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">{t('auth.username')}</label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full bg-[#060b18] border border-[#1e3a5f] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="你的昵称"
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('auth.email')}</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#060b18] border border-[#1e3a5f] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-1">{t('auth.password')}</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full bg-[#060b18] border border-[#1e3a5f] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700/50 text-red-400 text-sm px-4 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors cursor-pointer"
            >
              {loading ? t('common.loading') : (mode === 'login' ? t('auth.loginBtn') : t('auth.registerBtn'))}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to={mode === 'login' ? '/register' : '/login'}
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              {mode === 'login' ? t('auth.switchToRegister') : t('auth.switchToLogin')}
            </Link>
          </div>
        </div>

        {/* Free tier highlight */}
        {mode === 'register' && (
          <div className="mt-4 bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-2">免费会员权益：</h3>
            <ul className="space-y-1">
              {(t('membership.freeFeatures', { returnObjects: true }) as string[]).map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4 text-blue-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
