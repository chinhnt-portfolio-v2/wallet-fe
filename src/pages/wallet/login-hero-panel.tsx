import { Wallet, ShieldCheck, TrendingUp, Repeat } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const FEATURES = [
  { icon: ShieldCheck, key: 'login.feature1' },
  { icon: TrendingUp, key: 'login.feature2' },
  { icon: Repeat, key: 'login.feature3' },
] as const

/** Desktop-only left panel: brand + headline + 3 feature rows. */
export function LoginHeroPanel() {
  const { t } = useTranslation()

  return (
    <div className="hidden lg:flex flex-col justify-center px-14 py-16 bg-primary rounded-l-2xl min-h-full">
      {/* Brand mark */}
      <div className="flex items-center gap-3 mb-10">
        <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm">
          <Wallet className="w-6 h-6 text-white" aria-hidden="true" />
        </span>
        <span className="text-2xl font-extrabold text-white tracking-tight">Ví</span>
      </div>

      {/* Headline — h2 so the page keeps a single h1 (the "Ví" brand mark). */}
      <h2 className="text-4xl font-extrabold tracking-[-0.03em] text-white leading-tight mb-3">
        {t('login.headline')}
      </h2>
      <p className="text-sm text-white/70 mb-12 leading-relaxed">
        {t('login.headlineDesc')}
      </p>

      {/* Feature rows */}
      <div className="space-y-5">
        {FEATURES.map(({ icon: Icon, key }) => (
          <div key={key} className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
              <Icon className="w-4.5 h-4.5 text-white" aria-hidden="true" />
            </div>
            <p className="text-sm text-white/85 font-medium">{t(key)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
