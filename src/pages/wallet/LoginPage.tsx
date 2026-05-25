import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/stores/authStore'
import { login, register, googleOAuthUrl } from '@/api/auth'

const loginSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
})

const registerSchema = loginSchema.extend({
  name: z.string().optional(),
})

type FormValues = z.infer<typeof registerSchema>

export default function LoginPage() {
  const token = useAuthStore((s) => s.token)
  const setTokens = useAuthStore((s) => s.setTokens)
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register: registerForm,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: { email: '', password: '', name: '' },
  })

  if (token) {
    return <Navigate to="/" replace />
  }

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true)
    setSubmitError(null)
    try {
      const data = isRegister
        ? await register({
            email: values.email,
            password: values.password,
            name: values.name,
          })
        : await login({ email: values.email, password: values.password })
      setTokens(data.accessToken, data.refreshToken)
      navigate('/', { replace: true })
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Đăng nhập thất bại')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = googleOAuthUrl()
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="text-5xl text-accent mb-3 leading-none select-none" aria-hidden="true">◇</div>
          <h1 className="font-display italic text-3xl text-primary tracking-tight">ledger</h1>
          <p className="font-mono text-xs text-muted mt-1 tracking-widest uppercase">v2.0 · personal finance terminal</p>
        </div>

        {/* Card */}
        <div className="bg-surface border border-border rounded-lg p-6 flex flex-col gap-4">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            {isRegister && (
              <Input
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                autoComplete="name"
                {...registerForm('name')}
              />
            )}

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email?.message}
              {...registerForm('email')}
            />

            <Input
              label="Mật khẩu"
              type="password"
              placeholder="••••••••"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              error={errors.password?.message}
              {...registerForm('password')}
            />

            {submitError && (
              <p className="font-mono text-xs text-negative" role="alert">
                ✗ {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 bg-accent text-accent-ink font-mono text-sm font-medium tracking-widest uppercase px-4 py-2.5 rounded border border-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '...' : isRegister ? 'Đăng ký' : 'Đăng nhập'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface px-3 font-mono text-xs text-faint uppercase tracking-widest">hoặc</span>
            </div>
          </div>

          {/* Google OAuth ghost button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 border border-border rounded font-mono text-sm text-secondary px-4 py-2.5 hover:border-border-hi hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Tiếp tục với Google
          </button>

          {/* Toggle */}
          <p className="font-mono text-xs text-faint text-center">
            {isRegister ? 'Đã có tài khoản? ' : 'Chưa có tài khoản? '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setSubmitError(null)
              }}
              className="text-accent hover:underline bg-transparent border-none cursor-pointer"
            >
              {isRegister ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="font-mono text-center text-xs text-faint mt-5">
          Bằng việc tiếp tục, bạn đồng ý với{' '}
          <span className="underline cursor-pointer hover:text-muted transition-colors">Điều khoản</span>
          {' '}và{' '}
          <span className="underline cursor-pointer hover:text-muted transition-colors">Chính sách bảo mật</span>
        </p>
      </div>
    </div>
  )
}
