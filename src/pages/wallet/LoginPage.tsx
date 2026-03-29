import { Navigate } from 'react-router-dom'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '') + '/api'
const FRONTEND_URL = window.location.origin

export default function LoginPage() {
  const token = localStorage.getItem('wallet_token')
  if (token) {
    return <Navigate to="/" replace />
  }

  const handleGoogleLogin = () => {
    window.location.href = API_BASE + '/v1/auth/oauth2/login/google?redirect_uri=' + encodeURIComponent(FRONTEND_URL)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          {/* SVG Logo */}
          <div className="flex justify-center mb-4">
            <svg
              width="64"
              height="64"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="64" height="64" rx="16" fill="#0EA5E9" fillOpacity="0.1"/>
              <rect x="8" y="16" width="48" height="36" rx="8" fill="#0EA5E9" fillOpacity="0.15"/>
              <rect x="8" y="16" width="48" height="36" rx="8" stroke="#0EA5E9" strokeWidth="2"/>
              <line x1="8" y1="26" x2="56" y2="26" stroke="#0EA5E9" strokeWidth="2"/>
              <circle cx="44" cy="34" r="5" fill="#0EA5E9"/>
              <circle cx="44" cy="34" r="2.5" fill="white"/>
              <rect x="16" y="32" width="14" height="2" rx="1" fill="#0EA5E9" fillOpacity="0.6"/>
              <rect x="16" y="36" width="8" height="2" rx="1" fill="#0EA5E9" fillOpacity="0.4"/>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-primary">Wallet</h1>
          <p className="text-sm text-muted mt-2">Quản lý chi tiêu thông minh</p>
        </div>

        {/* Login button */}
        <button
          onClick={handleGoogleLogin}
          className="btn-primary w-full py-3 text-base flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Tiếp tục với Google
        </button>

        {/* Footer */}
        <p className="text-center text-xs text-muted mt-6">
          Bằng việc tiếp tục, bạn đồng ý với{' '}
          <span className="underline cursor-pointer">Điều khoản sử dụng</span>
          {' '}và{' '}
          <span className="underline cursor-pointer">Chính sách bảo mật</span>
        </p>
      </div>
    </div>
  )
}
