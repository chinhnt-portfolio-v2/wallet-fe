import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWallets, useCreateWallet } from '@/hooks/useWallets'

const STORAGE_KEY = 'wallet_onboarding_done'

// Static step metadata; titles/descriptions/CTAs are resolved via i18n keys.
const STEPS = [
  { step: 1, total: 3, emoji: '👋', titleKey: 'onboarding.step1Title', descKey: 'onboarding.step1Desc', ctaKey: 'onboarding.step1Cta' },
  { step: 2, total: 3, emoji: '💸', titleKey: 'onboarding.step2Title', descKey: 'onboarding.step2Desc', ctaKey: 'onboarding.step2Cta' },
  { step: 3, total: 3, emoji: '💸', titleKey: 'onboarding.step3Title', descKey: 'onboarding.step3Desc', ctaKey: 'onboarding.step3Cta' },
]

/**
 * useShouldShowOnboarding
 *
 * Returns true when the onboarding modal should render.
 * Conditions:
 *   1. User is logged in (wallet_token exists in localStorage)
 *   2. Wallet query has resolved AND user has exactly zero wallets
 *   3. Onboarding has not been completed before (localStorage)
 *
 * `shouldShow` is derived during render (no setState-in-effect) so the value
 * updates synchronously as the wallet query resolves.
 */
export function useShouldShowOnboarding() {
  const token = localStorage.getItem('wallet_token')
  const { data: wallets, isLoading, isError } = useWallets()

  const completed = localStorage.getItem(STORAGE_KEY)

  const shouldShow =
    !completed && !isLoading && !isError && !!token && !!wallets && wallets.length === 0

  return { shouldShow, isLoading, wallets }
}

/**
 * OnboardingModal
 *
 * Full-screen overlay wizard shown on first login when user has no wallets.
 * 3 steps with step indicator dots, skip link, and final CTA that
 * creates a sample wallet and navigates to /wallets.
 */
export function OnboardingModal() {
  const { shouldShow, isLoading } = useShouldShowOnboarding()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const createWallet = useCreateWallet()

  const [current, setCurrent] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  // Visibility is derived from eligibility + local dismissal (no setState effect).
  const open = shouldShow && !dismissed

  if (isLoading || dismissed || !shouldShow) return null

  const step = STEPS[current]
  const isLast = current === STEPS.length - 1

  const handleClose = () => {
    setDismissed(true)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  const handleSkip = () => {
    setDismissed(true)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  const handleNext = async () => {
    if (isLast) {
      // Create a sample wallet then navigate to /add to add first transaction
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
        // Wallet may already exist (race condition); navigate regardless
      }
      localStorage.setItem(STORAGE_KEY, 'true')
      navigate('/add', { replace: true })
      return
    }
    setCurrent((c) => c + 1)
  }

  return (
    <OnboardingOverlay open={open} onClose={handleClose}>
      <div className="flex flex-col h-full min-h-0">
        {/* Skip link */}
        <div className="flex justify-end mb-1 shrink-0">
          <button
            onClick={handleSkip}
            className="text-xs text-muted hover:text-accent transition-colors px-1 py-0.5"
          >
            {t('onboarding.skip')}
          </button>
        </div>

        {/* Illustration area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-5 py-4 min-h-0">
          {/* Large emoji icon with accent ring */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center text-5xl select-none">
              {step.emoji}
            </div>
            {/* Step badge */}
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
              <span className="text-white text-2xs font-bold">{step.step}</span>
            </div>
          </div>

          {/* Text */}
          <div className="text-center space-y-2 max-w-[260px]">
            <h2 className="text-lg font-bold text-primary leading-snug">
              {t(step.titleKey)}
            </h2>
            <p className="text-sm text-muted leading-relaxed">
              {t(step.descKey)}
            </p>
          </div>
        </div>

        {/* Footer: dots + progress + CTA */}
        <div className="shrink-0 pt-2 pb-1 space-y-4">
          {/* Step dots */}
          <div className="flex items-center justify-center gap-2">
            {STEPS.map((s, i) => (
              <div
                key={s.step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 bg-accent'
                    : i < current
                    ? 'w-1.5 bg-accent/40'
                    : 'w-1.5 bg-border'
                }`}
              />
            ))}
          </div>

          {/* Progress label */}
          <p className="text-center text-xs text-muted">
            {t('onboarding.stepProgress', { step: step.step, total: step.total })}
          </p>

          {/* CTA */}
          <button
            onClick={handleNext}
            disabled={createWallet.isPending}
            className="w-full py-3 rounded-full bg-accent text-white font-semibold text-sm
                       hover:bg-accent/90 active:scale-95 transition-all duration-150
                       disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
          >
            {createWallet.isPending ? t('onboarding.processing') : t(step.ctaKey)}
          </button>
        </div>
      </div>
    </OnboardingOverlay>
  )
}

/* ── Full-screen overlay ─────────────────────────────────── */
interface OnboardingOverlayProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

function OnboardingOverlay({ open, onClose, children }: OnboardingOverlayProps) {
  const { t } = useTranslation()

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label={t('onboarding.dialogAria')}
    >
      {/* Blurred backdrop */}
      <div
        className="absolute inset-0 bg-bg/95 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="relative flex-1 flex flex-col justify-end mx-4 mb-6 mt-20 rounded-2xl overflow-hidden
                    bg-surface border border-border shadow-2xl animate-slide-up"
      >
        {/* Gradient accent bar at top */}
        <div className="h-1 w-full bg-gradient-to-r from-accent via-accent/60 to-accent shrink-0" />

        <div className="flex-1 px-5 py-5 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  )
}
