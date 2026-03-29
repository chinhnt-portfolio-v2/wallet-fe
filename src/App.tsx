import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { Toaster } from 'sonner'
import { useWallets } from '@/hooks/useWallets'

const DashboardPage = lazy(() => import('@/pages/wallet/DashboardPage'))
const TransactionsPage = lazy(() => import('@/pages/wallet/TransactionsPage'))
const AddTransactionPage = lazy(() => import('@/pages/wallet/AddTransactionPage'))
const DebtGroupsPage = lazy(() => import('@/pages/wallet/DebtGroupsPage'))
const DebtGroupDetailPage = lazy(() => import('@/pages/wallet/DebtGroupDetailPage'))
const CreateDebtGroupPage = lazy(() => import('@/pages/wallet/CreateDebtGroupPage'))
const WalletsPage = lazy(() => import('@/pages/wallet/WalletsPage'))
const CategoriesPage = lazy(() => import('@/pages/wallet/CategoriesPage'))
const ProfilePage = lazy(() => import('@/pages/wallet/ProfilePage'))
const TransferPage = lazy(() => import('@/pages/wallet/TransferPage'))
const BudgetsPage = lazy(() => import('@/pages/wallet/BudgetsPage'))
const RecurringPage = lazy(() => import('@/pages/wallet/RecurringPage'))
const ExportPage = lazy(() => import('@/pages/wallet/ExportPage'))
const LoginPage = lazy(() => import('@/pages/wallet/LoginPage'))

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-muted text-sm animate-pulse">Loading…</div>
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('wallet_token')
  if (!token) return <Navigate to="/login" replace />
  return <>{children}</>
}

function DarkModeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      aria-label={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
      className="w-8 h-8 flex items-center justify-center rounded-md text-sm hover:bg-surface-2 transition-colors"
    >
      {isDark ? (
        /* Sun icon */
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        /* Moon icon */
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}

function WalletLogo() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="3" fill="#0EA5E9" opacity="0.15"/>
      <rect x="2" y="4" width="20" height="16" rx="3" stroke="#0EA5E9" strokeWidth="1.5"/>
      <circle cx="16" cy="12" r="2" fill="#0EA5E9"/>
      <line x1="2" y1="9" x2="22" y2="9" stroke="#0EA5E9" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  )
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('wallet_theme')
    if (stored) return stored === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const { data: wallets } = useWallets()
  const hasNoWallets = !wallets || wallets.length === 0

  const toggleDark = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('wallet_theme', next ? 'dark' : 'light')
  }

  return (
    <div className="min-h-screen bg-bg pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-sm border-b border-border">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 text-base font-semibold text-primary">
            <WalletLogo />
            <span>Wallet</span>
          </a>
          {/* Actions */}
          <div className="flex items-center gap-1">
            <DarkModeToggle isDark={isDark} onToggle={toggleDark} />
            <a
              href="/profile"
              aria-label="Cài đặt"
              className="w-8 h-8 flex items-center justify-center rounded-md text-sm text-muted hover:text-primary hover:bg-surface-2 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </a>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-lg mx-auto px-4 py-4">
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </main>

      {/* FAB */}
      {hasNoWallets ? (
        <button
          aria-label="Tạo ví trước khi thêm giao dịch"
          title="Tạo ví trước khi thêm giao dịch"
          className="fixed bottom-20 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg
                     flex items-center justify-center text-2xl font-light
                     opacity-40 cursor-not-allowed transition-all duration-150 z-40
                     pb-[env(safe-area-inset-bottom)]"
          disabled
        >
          +
        </button>
      ) : (
        <a
          href="/add"
          aria-label="Thêm giao dịch"
          className="fixed bottom-20 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg
                     flex items-center justify-center text-2xl font-light
                     hover:bg-primary/90 active:scale-95 transition-all duration-150 z-40
                     pb-[env(safe-area-inset-bottom)]"
        >
          +
        </a>
      )}

      {/* Bottom nav */}
      <nav aria-label="Điều hướng chính" className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-30">
        <div className="max-w-lg mx-auto flex pb-[env(safe-area-inset-bottom)]">
          {[
            { href: '/', label: 'Tổng quan', icon: '🏠' },
            { href: '/transactions', label: 'Giao dịch', icon: '📋' },
            { href: '/debts', label: 'Nợ', icon: '📑' },
            { href: '/wallets', label: 'Ví', icon: '💼' },
          ].map(({ href, label, icon }) => (
            <a
              key={href}
              href={href}
              aria-label={label}
              className="flex-1 flex flex-col items-center py-2 text-xs text-muted hover:text-primary transition-colors"
            >
              <span aria-hidden="true">{icon}</span>
              <span className="mt-0.5">{label}</span>
            </a>
          ))}
        </div>
      </nav>
    </div>
  )
}

/**
 * OAuthCallbackHandler
 *
 * Supports TWO OAuth flows:
 *
 * 1. Authorization Code flow (NEW — recommended):
 *    BE redirects to FRONTEND_URL?code=AUTH_CODE
 *    → POST /api/v1/auth/oauth2/callback { code }
 *    → BE sets httpOnly cookie, returns { accessToken }
 *
 * 2. Implicit flow (CURRENT BE — backward compatible):
 *    BE redirects to FRONTEND_URL?accessToken=...&refreshToken=...
 *    → read tokens from URL, save to localStorage, clear URL
 */
function OAuthCallbackHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code         = params.get('code')
    const accessToken  = params.get('accessToken')
    const refreshToken = params.get('refreshToken')

    // ── New: Authorization Code flow ──────────────────────────────
    if (code) {
      fetch('/api/v1/auth/oauth2/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
        credentials: 'include',
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.accessToken) {
            localStorage.setItem('wallet_token', data.accessToken)
            localStorage.setItem('wallet_refresh_token', data.refreshToken ?? '')
          }
          window.history.replaceState(null, '', '/')
          navigate('/', { replace: true })
        })
        .catch(() => {
          window.history.replaceState(null, '', '/login')
          navigate('/login', { replace: true })
        })
      return
    }

    // ── Old: Implicit flow (current BE — backward compatible) ───
    if (accessToken && refreshToken) {
      localStorage.setItem('wallet_token', accessToken)
      localStorage.setItem('wallet_refresh_token', refreshToken)
      window.history.replaceState(null, '', '/')
      navigate('/', { replace: true })
      return
    }
  }, [navigate])

  return null
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="bottom-center" richColors />
        <OAuthCallbackHandler />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><AppShell><DashboardPage /></AppShell></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><AppShell><TransactionsPage /></AppShell></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute><AppShell><AddTransactionPage /></AppShell></ProtectedRoute>} />
          <Route path="/debts" element={<ProtectedRoute><AppShell><DebtGroupsPage /></AppShell></ProtectedRoute>} />
          <Route path="/debts/new" element={<ProtectedRoute><AppShell><CreateDebtGroupPage /></AppShell></ProtectedRoute>} />
          <Route path="/debts/:id" element={<ProtectedRoute><AppShell><DebtGroupDetailPage /></AppShell></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><AppShell><ProfilePage /></AppShell></ProtectedRoute>} />
          <Route path="/wallets" element={<ProtectedRoute><AppShell><WalletsPage /></AppShell></ProtectedRoute>} />
          <Route path="/wallets/transfer" element={<ProtectedRoute><AppShell><TransferPage /></AppShell></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><AppShell><CategoriesPage /></AppShell></ProtectedRoute>} />
          <Route path="/budgets" element={<ProtectedRoute><AppShell><BudgetsPage /></AppShell></ProtectedRoute>} />
          <Route path="/recurring" element={<ProtectedRoute><AppShell><RecurringPage /></AppShell></ProtectedRoute>} />
          <Route path="/export" element={<ProtectedRoute><AppShell><ExportPage /></AppShell></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
