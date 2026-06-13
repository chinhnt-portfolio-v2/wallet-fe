import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Wallet } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { login, register, googleOAuthUrl } from '@/api/auth'
import { APP_VERSION } from '@/lib/app-meta'
import { LoginHeroPanel } from './login-hero-panel'
import { LoginForm } from './login-form'

export default function LoginPage() {
  const token = useAuthStore((s) => s.token)
  const setTokens = useAuthStore((s) => s.setTokens)
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  if (token) return <Navigate to="/" replace />

  const handleSubmit = async (
    values: { email: string; password: string; name?: string },
    isRegister: boolean,
  ) => {
    setIsLoading(true)
    setSubmitError(null)
    try {
      const data = isRegister
        ? await register({ email: values.email, password: values.password, name: values.name })
        : await login({ email: values.email, password: values.password })
      setTokens(data.accessToken, data.refreshToken)
      navigate('/', { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t('login.loginFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = googleOAuthUrl()
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      {/* Single shell: mobile = centered column; desktop (lg) = split card with
          a hero panel on the left. The LoginForm is rendered ONCE (no duplicate
          element ids) and adapts its wrapper via responsive utilities. */}
      <div className="w-full max-w-md lg:max-w-[980px] lg:min-h-[620px] flex lg:rounded-2xl lg:overflow-hidden lg:shadow-modal">
        {/* Hero panel — desktop only */}
        <div className="hidden lg:block w-[520px] shrink-0">
          <LoginHeroPanel />
        </div>

        {/* Form column */}
        <div className="flex-1 flex flex-col justify-center gap-8 lg:gap-0 lg:bg-surface lg:px-12 lg:py-10">
          {/* Brand — stacked + centered on mobile, inline row on desktop */}
          <div className="text-center lg:text-left lg:mb-8">
            <div className="inline-flex flex-col items-center lg:flex-row lg:gap-2.5">
              <span className="inline-flex items-center justify-center w-14 h-14 lg:w-8 lg:h-8 rounded-2xl lg:rounded-xl bg-primary shrink-0">
                <Wallet className="w-7 h-7 lg:w-4 lg:h-4 text-primary-ink" aria-hidden="true" />
              </span>
              <h1 className="text-2xl lg:text-lg font-extrabold tracking-[-0.02em] text-ink mt-4 lg:mt-0">
                Ví
              </h1>
            </div>
            <p className="text-xs text-muted mt-1 tracking-widest uppercase lg:hidden">
              {APP_VERSION} · {t('login.tagline')}
            </p>
          </div>

          {/* Form — single instance; carded on mobile, bare on the desktop surface column */}
          <div className="bg-surface border border-line rounded-2xl p-6 shadow-pop lg:border-0 lg:p-0 lg:rounded-none lg:shadow-none">
            <LoginForm
              onSubmit={handleSubmit}
              onGoogleLogin={handleGoogleLogin}
              isLoading={isLoading}
              submitError={submitError}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
