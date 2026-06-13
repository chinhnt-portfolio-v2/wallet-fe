import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Wallet, TrendingUp, Repeat } from 'lucide-react'
import { useWallets, useCreateWallet } from '@/hooks/useWallets'

const STORAGE_KEY = 'wallet_onboarding_done'

// ─── Feature rows shown in the illustration block ────────

const FEATURES = [
  { icon: Wallet,    key: 'onboarding.featureWallet'   },
  { icon: TrendingUp, key: 'onboarding.featureBudget'  },
  { icon: Repeat,    key: 'onboarding.featureRecurring' },
] as const

// ─── Steps ────────────────────────────────────────────────

const STEPS = [
  { step: 1, total: 3, titleKey: 'onboarding.step1Title', descKey: 'onboarding.step1Desc', ctaKey: 'onboarding.step1Cta' },
  { step: 2, total: 3, titleKey: 'onboarding.step2Title', descKey: 'onboarding.step2Desc', ctaKey: 'onboarding.step2Cta' },
  { step: 3, total: 3, titleKey: 'onboarding.step3Title', descKey: 'onboarding.step3Desc', ctaKey: 'onboarding.step3Cta' },
]

// ─── Hook ─────────────────────────────────────────────────

export function useShouldShowOnboarding() {
  const token = localStorage.getItem('wallet_token')
  const { data: wallets, isLoading, isError } = useWallets()
  const completed = localStorage.getItem(STORAGE_KEY)
  const shouldShow =
    !completed && !isLoading && !isError && !!token && !!wallets && wallets.length === 0
  return { shouldShow, isLoading, wallets }
}

// ─── Illustration block ───────────────────────────────────

function IllustrationBlock({ name }: { name?: string }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center gap-6 bg-primary-soft rounded-2xl p-8">
      {/* Big wallet icon */}
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-fab">
          <Wallet className="w-10 h-10 text-primary-ink" aria-hidden="true" />
        </div>
        {/* Floating chip */}
        <div className="absolute -top-3 -right-4 px-2.5 py-1 bg-surface border border-line rounded-full shadow-pop">
          <span className="text-[10px] font-extrabold text-positive uppercase tracking-wide">
            {t('onboarding.chipFree')}
          </span>
        </div>
      </div>

      {/* Welcome headline */}
      <div className="text-center space-y-1">
        <h2 className="text-lg font-extrabold tracking-[-0.02em] text-ink leading-snug">
          {t('onboarding.welcomeTitle', { name: name ?? t('onboarding.defaultName') })}
        </h2>
        <p className="text-xs text-muted">{t('onboarding.welcomeDesc')}</p>
      </div>

      {/* Feature rows */}
      <div className="w-full space-y-2.5">
        {FEATURES.map(({ icon: Icon, key }) => (
          <div key={key} className="flex items-center gap-3 bg-surface rounded-xl px-3 py-2.5 border border-line">
            <div className="w-7 h-7 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
              <Icon className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
            </div>
            <span className="text-xs font-medium text-ink">{t(key)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Progress dots ────────────────────────────────────────

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current ? 'w-6 bg-primary' : i < current ? 'w-1.5 bg-primary/40' : 'w-1.5 bg-line'
          }`}
        />
      ))}
    </div>
  )
}

// ─── Main modal ───────────────────────────────────────────

export function OnboardingModal() {
  const { shouldShow, isLoading } = useShouldShowOnboarding()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const createWallet = useCreateWallet()

  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState(false)
  const closeRef = useRef<HTMLButtonElement>(null)

  const open = shouldShow && !dismissed

  // Focus trap: focus the modal when it opens
  useEffect(() => {
    if (open) closeRef.current?.focus()
  }, [open])

  if (isLoading || dismissed || !shouldShow) return null

  const step = STEPS[current]
  const isLast = current === STEPS.length - 1

  const handleClose = () => {
    setDismissed(true)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  const handleNext = async () => {
    if (isLast) {
      try {
        await createWallet.mutateAsync({
          name: t('onboarding.sampleWalletName'),
          type: 'CASH',
          currency: 'VND',
          icon: '💰',
          color: '#0EA5E9',
          initialBalance: 0,
        })
      } catch {
        // Wallet may already exist; navigate regardless
      }
      localStorage.setItem(STORAGE_KEY, 'true')
      navigate('/add', { replace: true })
      return
    }
    setCurrent((c) => c + 1)
  }

  return (
    <OnboardingOverlay open={open} onClose={handleClose}>
      {/* Mobile layout: stacked */}
      <div className="lg:hidden flex flex-col gap-5 h-full min-h-0">
        <IllustrationBlock />

        <div className="flex flex-col gap-4 flex-1">
          <ProgressDots current={current} total={STEPS.length} />

          <div className="text-center space-y-1.5">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted">
              {t('onboarding.stepProgress', { step: step.step, total: step.total })}
            </p>
            <h3 className="text-base font-extrabold text-ink">{t(step.titleKey)}</h3>
            <p className="text-sm text-muted leading-relaxed">{t(step.descKey)}</p>
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleNext}
              disabled={createWallet.isPending}
              className="w-full h-11 rounded-xl bg-primary text-primary-ink font-semibold text-sm
                         hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed
                         transition-colors shadow-button active:scale-[.98]"
            >
              {createWallet.isPending ? t('onboarding.processing') : t(step.ctaKey)}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-full h-9 text-xs text-muted hover:text-ink transition-colors"
            >
              {t('onboarding.skip')}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop layout: side-by-side */}
      <div className="hidden lg:flex gap-8 h-full min-h-0">
        {/* Left: illustration */}
        <div className="w-72 shrink-0 flex flex-col justify-center">
          <IllustrationBlock />
        </div>

        {/* Right: content */}
        <div className="flex-1 flex flex-col justify-between py-2">
          {/* Skip */}
          <div className="flex justify-end">
            <button
              ref={closeRef}
              type="button"
              onClick={handleClose}
              className="text-xs text-muted hover:text-ink transition-colors px-1 py-0.5
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
            >
              {t('onboarding.skip')}
            </button>
          </div>

          {/* Step content */}
          <div className="space-y-3">
            <ProgressDots current={current} total={STEPS.length} />
            <div className="space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted">
                {t('onboarding.stepProgress', { step: step.step, total: step.total })}
              </p>
              <h3 className="text-xl font-extrabold tracking-[-0.02em] text-ink">{t(step.titleKey)}</h3>
              <p className="text-sm text-muted leading-relaxed">{t(step.descKey)}</p>
            </div>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={handleNext}
            disabled={createWallet.isPending}
            className="w-full h-11 rounded-xl bg-primary text-primary-ink font-semibold text-sm
                       hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed
                       transition-colors shadow-button active:scale-[.98]"
          >
            {createWallet.isPending ? t('onboarding.processing') : t(step.ctaKey)}
          </button>
        </div>
      </div>
    </OnboardingOverlay>
  )
}

// ─── Overlay ──────────────────────────────────────────────

interface OnboardingOverlayProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

function OnboardingOverlay({ open, onClose, children }: OnboardingOverlayProps) {
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={t('onboarding.dialogAria')}
    >
      {/* Scrim */}
      <div
        className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — bottom sheet on mobile, centred modal on desktop */}
      <div
        className="relative w-full lg:w-[760px] lg:max-h-[560px]
                   bg-surface border border-line
                   rounded-t-2xl lg:rounded-2xl
                   shadow-modal overflow-hidden
                   animate-slide-up lg:animate-none
                   mx-0 lg:mx-8 mb-0 lg:mb-0"
      >
        {/* Brand accent bar */}
        <div className="h-1 w-full bg-primary shrink-0" />
        <div className="p-5 lg:p-8 lg:min-h-[480px] flex flex-col">
          {children}
        </div>
      </div>
    </div>
  )
}
