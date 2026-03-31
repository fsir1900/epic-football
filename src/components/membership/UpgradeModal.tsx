import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface UpgradeModalProps {
  onClose: () => void;
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-green-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function UpgradeModal({ onClose }: UpgradeModalProps) {
  const { t } = useTranslation();
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');

  const freeFeat = t('membership.freeFeatures', { returnObjects: true }) as string[];
  const monthlyFeat = t('membership.monthlyFeatures', { returnObjects: true }) as string[];
  const annualFeat = t('membership.annualFeatures', { returnObjects: true }) as string[];

  const plans = [
    {
      id: 'free',
      label: t('membership.free'),
      price: '$0',
      per: '',
      badge: t('membership.freeBadge'),
      badgeColor: 'bg-gray-700 text-gray-300',
      features: freeFeat,
      cta: t('nav.register'),
      ctaTo: '/register',
      cardBorder: 'border-[#1e3a5f]',
      ctaStyle: 'bg-gray-700 hover:bg-gray-600 text-white',
      popular: false,
    },
    {
      id: 'monthly',
      label: t('membership.monthly'),
      price: t('membership.monthlyPrice'),
      per: t('membership.monthlyPer'),
      badge: 'PRO',
      badgeColor: 'bg-blue-600 text-white',
      features: monthlyFeat,
      cta: t('membership.upgradeBtn'),
      ctaTo: '/pricing',
      cardBorder: 'border-blue-600/50',
      ctaStyle: 'bg-blue-600 hover:bg-blue-500 text-white',
      popular: false,
    },
    {
      id: 'annual',
      label: t('membership.annual'),
      price: t('membership.annualPrice'),
      per: t('membership.annualPer'),
      badge: t('membership.saveLabel'),
      badgeColor: 'bg-amber-500 text-black',
      features: annualFeat,
      cta: t('membership.upgradeBtn'),
      ctaTo: '/pricing',
      cardBorder: 'border-amber-500/60',
      ctaStyle: 'bg-amber-500 hover:bg-amber-400 text-black font-bold',
      popular: true,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl bg-[#080f1f] border border-[#1e3a5f] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900/60 to-[#0d1829] px-6 py-5 border-b border-[#1e3a5f] flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white">{t('membership.upgradeTitle')}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{t('membership.upgradeSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors cursor-pointer p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toggle (monthly/annual hint) */}
        <div className="flex justify-center pt-5 pb-1 gap-3">
          {(['monthly', 'annual'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlan(p)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
                plan === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#0d1829] text-gray-400 border border-[#1e3a5f] hover:text-white'
              }`}
            >
              {p === 'monthly' ? t('membership.monthly') : t('membership.annual')}
              {p === 'annual' && (
                <span className="ml-1.5 text-xs bg-amber-500 text-black font-bold px-1.5 py-0.5 rounded-full">
                  {t('membership.saveLabel')}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
          {plans.map((p) => {
            // For monthly/annual toggle: only show the selected paid plan in compare view
            const isHidden = (p.id === 'monthly' && plan === 'annual') || (p.id === 'annual' && plan === 'monthly');
            if (isHidden) return null;

            return (
              <div
                key={p.id}
                className={`relative bg-[#0d1829] border ${p.cardBorder} rounded-xl p-5 flex flex-col ${
                  p.popular ? 'ring-2 ring-amber-500/50' : ''
                }`}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-full whitespace-nowrap">
                      ⭐ {t('membership.popularLabel')}
                    </span>
                  </div>
                )}

                {/* Badge */}
                <span className={`self-start text-xs font-bold px-2 py-0.5 rounded-full mb-3 ${p.badgeColor}`}>
                  {p.badge}
                </span>

                {/* Plan name */}
                <h3 className="text-white font-bold text-base mb-1">{p.label}</h3>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black text-white">{p.price}</span>
                  {p.per && <span className="text-gray-400 text-sm">{p.per}</span>}
                </div>

                {/* Annual savings callout */}
                {p.id === 'annual' && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2 mb-3 text-xs text-amber-300">
                    vs ${29 * 12} monthly → <span className="font-bold text-amber-400">Save ${29 * 12 - 299}</span>
                  </div>
                )}

                {/* Features */}
                <ul className="space-y-2 mb-5 flex-1">
                  {p.features.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <CheckIcon />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link
                  to={p.ctaTo}
                  onClick={onClose}
                  className={`block w-full text-center py-2.5 rounded-xl text-sm transition-colors cursor-pointer ${p.ctaStyle}`}
                >
                  {p.cta}
                </Link>
              </div>
            );
          })}
        </div>

        {/* Bottom note */}
        <div className="px-6 pb-5 text-center">
          <p className="text-gray-600 text-xs">{t('membership.choosePlan')}</p>
        </div>
      </div>
    </div>
  );
}
