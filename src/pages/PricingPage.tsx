import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';

export default function PricingPage() {
  const { t } = useTranslation();
  const { user, isAuthenticated, upgradeToPro } = useAuthStore();

  const plans = [
    {
      id: 'free',
      name: t('membership.free'),
      badge: t('membership.freeBadge'),
      price: t('common.loading').includes('加') ? '免费' : 'Free',
      priceRaw: '¥0',
      features: t('membership.freeFeatures', { returnObjects: true }) as string[],
      cta: isAuthenticated ? (user?.isPro ? '当前不适用' : '当前套餐') : t('nav.register'),
      ctaHref: isAuthenticated ? '#' : '/register',
      highlight: false,
      isPro: false,
    },
    {
      id: 'pro',
      name: t('membership.pro'),
      badge: t('membership.proBadge'),
      price: t('membership.price'),
      priceRaw: '¥68',
      features: t('membership.proFeatures', { returnObjects: true }) as string[],
      cta: isAuthenticated
        ? user?.isPro
          ? '已是会员'
          : t('membership.upgradeBtn')
        : t('membership.upgradeBtn'),
      ctaHref: '#',
      highlight: true,
      isPro: true,
    },
  ];

  return (
    <div className="min-h-screen bg-[#060b18] text-white pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-3">{t('pricing.title')}</h1>
          <p className="text-gray-400">{t('pricing.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-2xl p-6 border relative overflow-hidden ${
                plan.highlight
                  ? 'bg-gradient-to-b from-blue-700/30 to-[#0d1829] border-blue-500 ring-1 ring-blue-500'
                  : 'bg-[#0d1829] border-[#1e3a5f]'
              }`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
              )}

              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white">{plan.name}</h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  plan.highlight ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}>
                  {plan.badge}
                </span>
              </div>

              <div className="mb-6">
                <div className="text-4xl font-black text-white">{plan.priceRaw}</div>
                <div className="text-sm text-gray-400 mt-1">{plan.isPro ? '/月' : '永久免费'}</div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <svg className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlight ? 'text-blue-400' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>

              {plan.isPro ? (
                <button
                  onClick={() => {
                    if (isAuthenticated && !user?.isPro) {
                      upgradeToPro();
                      alert('🎉 恭喜升级为 Pro 会员！（演示模式）');
                    }
                  }}
                  disabled={!isAuthenticated || !!user?.isPro}
                  className={`w-full py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                    user?.isPro
                      ? 'bg-green-700/30 text-green-400 border border-green-700/50'
                      : isAuthenticated
                      ? 'bg-blue-600 hover:bg-blue-500 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {user?.isPro ? '✓ 已是 Pro 会员' : isAuthenticated ? plan.cta : '请先登录'}
                </button>
              ) : (
                <a
                  href={plan.ctaHref}
                  className={`block w-full py-3 rounded-xl font-bold text-sm text-center transition-colors ${
                    isAuthenticated
                      ? 'bg-gray-700/50 text-gray-400 border border-gray-700 cursor-default'
                      : 'bg-[#060b18] border border-[#1e3a5f] hover:border-blue-500/50 text-gray-300 hover:text-white cursor-pointer'
                  }`}
                >
                  {isAuthenticated ? (user?.isPro ? '免费版' : '✓ 当前套餐') : plan.cta}
                </a>
              )}
            </div>
          ))}
        </div>

        {/* Feature comparison */}
        <div className="mt-12 bg-[#0d1829] border border-[#1e3a5f] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e3a5f]">
            <h2 className="font-bold text-white">详细对比</h2>
          </div>
          <div className="divide-y divide-[#1e3a5f]">
            {[
              { feature: '注册免费分析次数', free: '2次', pro: '无限次' },
              { feature: '今日比赛分析', free: '仅2次', pro: '✓ 无限' },
              { feature: '历史比赛结果', free: '✓ 免费', pro: '✓ 免费' },
              { feature: 'WIN/FALSE 标记', free: '✓', pro: '✓' },
              { feature: 'AI 置信度分析', free: '✗', pro: '✓' },
              { feature: '球队深度统计', free: '✗', pro: '✓' },
              { feature: '优先客服', free: '✗', pro: '✓' },
            ].map((row) => (
              <div key={row.feature} className="grid grid-cols-3 px-6 py-3 text-sm">
                <span className="text-gray-300">{row.feature}</span>
                <span className={`text-center ${row.free.startsWith('✓') ? 'text-green-400' : row.free.startsWith('✗') ? 'text-gray-600' : 'text-gray-400'}`}>
                  {row.free}
                </span>
                <span className={`text-center ${row.pro.startsWith('✓') ? 'text-blue-400' : 'text-gray-400'}`}>
                  {row.pro}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          * 演示模式 · 实际支付系统需接入支付宝/微信支付 · 数据来源 football-data.org
        </p>
      </div>
    </div>
  );
}
