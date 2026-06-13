import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { cn } from '@/lib/utils'

interface FormValues {
  email: string
  password: string
  name?: string
}

interface LoginFormProps {
  onSubmit: (values: FormValues, isRegister: boolean) => Promise<void>
  onGoogleLogin: () => void
  isLoading: boolean
  submitError: string | null
}

export function LoginForm({ onSubmit, onGoogleLogin, isLoading, submitError }: LoginFormProps) {
  const { t } = useTranslation()
  const [isRegister, setIsRegister] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const schema = z.object({
    email: z.string().email(t('login.invalidEmail')),
    password: z.string().min(6, t('login.passwordMin')),
    name: isRegister ? z.string().optional() : z.string().optional(),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '', name: '' },
  })

  const modeOptions = [
    { value: 'login', label: t('login.signIn') },
    { value: 'register', label: t('login.signUp') },
  ]

  const handleModeChange = (v: string) => {
    setIsRegister(v === 'register')
    reset()
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Tab switcher */}
      <div className="flex justify-center">
        <SegmentedControl
          options={modeOptions}
          value={isRegister ? 'register' : 'login'}
          onChange={handleModeChange}
          size="md"
          ariaLabel={t('login.modeLabel')}
        />
      </div>

      <form
        onSubmit={handleSubmit((vals) => onSubmit(vals, isRegister))}
        className="flex flex-col gap-4"
        noValidate
      >
        {/* Name field (register only) */}
        {isRegister && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-sub" htmlFor="login-name">
              {t('login.name')}
            </label>
            <input
              id="login-name"
              type="text"
              autoComplete="name"
              placeholder={t('login.namePlaceholder')}
              className="w-full h-11 px-4 rounded-lg border border-line bg-surface text-sm text-ink
                         placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30
                         transition-shadow"
              {...register('name')}
            />
          </div>
        )}

        {/* Email field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-sub" htmlFor="login-email">
            {t('login.email')}
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-describedby={errors.email ? 'login-email-error' : undefined}
              aria-invalid={!!errors.email}
              className={cn(
                'w-full h-11 pl-10 pr-4 rounded-lg border bg-surface text-sm text-ink',
                'placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow',
                errors.email ? 'border-negative' : 'border-line',
              )}
              {...register('email')}
            />
          </div>
          {errors.email && (
            <p id="login-email-error" role="alert" className="text-xs text-negative">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password field */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-sub" htmlFor="login-password">
              {t('login.password')}
            </label>
            {!isRegister && (
              <button
                type="button"
                className="text-[11px] text-primary hover:underline bg-transparent border-none cursor-pointer"
              >
                {t('login.forgotPassword')}
              </button>
            )}
          </div>
          <div className="relative">
            <Lock
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="login-password"
              type={showPwd ? 'text' : 'password'}
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              placeholder="••••••••"
              aria-describedby={errors.password ? 'login-password-error' : undefined}
              aria-invalid={!!errors.password}
              className={cn(
                'w-full h-11 pl-10 pr-11 rounded-lg border bg-surface text-sm text-ink',
                'placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 transition-shadow',
                errors.password ? 'border-negative' : 'border-line',
              )}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? t('login.hidePassword') : t('login.showPassword')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center
                         text-muted hover:text-ink transition-colors focus:outline-none focus-visible:ring-2
                         focus-visible:ring-primary/40 rounded"
            >
              {showPwd
                ? <EyeOff className="w-4 h-4" aria-hidden="true" />
                : <Eye className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>
          {errors.password && (
            <p id="login-password-error" role="alert" className="text-xs text-negative">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit error */}
        {submitError && (
          <p role="alert" className="text-xs text-negative bg-negative/5 border border-negative/20 rounded-lg px-3 py-2">
            {submitError}
          </p>
        )}

        {/* Primary CTA */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 mt-1 flex items-center justify-center gap-2
                     bg-primary text-primary-ink text-sm font-semibold rounded-lg
                     hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors shadow-button active:scale-[.98]"
        >
          {isLoading ? (
            <span className="animate-pulse">{t('common.processing')}</span>
          ) : (
            <>
              {isRegister ? t('login.signUp') : t('login.signIn')}
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px bg-line" />
        <span className="text-[11px] text-muted uppercase tracking-widest shrink-0">
          {t('login.orContinueWith')}
        </span>
        <div className="flex-1 h-px bg-line" />
      </div>

      {/* Google OAuth button */}
      <button
        type="button"
        onClick={onGoogleLogin}
        className="w-full h-11 flex items-center justify-center gap-2.5
                   border border-line rounded-lg text-sm text-sub font-medium
                   hover:bg-hover transition-colors"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {t('login.continueWithGoogle')}
      </button>

      {/* Terms footer */}
      <p className="text-[11px] text-muted text-center leading-relaxed">
        {t('login.agreePrefix')}
        <button type="button" className="underline cursor-pointer hover:text-sub transition-colors bg-transparent border-none text-[11px]">
          {t('login.terms')}
        </button>
        {t('login.and')}
        <button type="button" className="underline cursor-pointer hover:text-sub transition-colors bg-transparent border-none text-[11px]">
          {t('login.privacy')}
        </button>
      </p>
    </div>
  )
}
