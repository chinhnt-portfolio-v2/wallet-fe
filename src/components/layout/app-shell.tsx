import { Suspense } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWallets } from '@/hooks/useWallets'
import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Sidebar } from '@/components/layout/sidebar'

// Routes whose primary form CTA (SAVE / CONFIRM / CREATE) the FAB would overlap.
// Hide the mobile FAB on these so it never covers the submit button (audit §3).
const FAB_HIDDEN_ROUTES = ['/add', '/wallets/transfer', '/debts/new']

function shouldHideFab(pathname: string): boolean {
  return FAB_HIDDEN_ROUTES.some((r) => pathname === r || pathname.startsWith(`${r}/`))
}

function PageLoader() {
  const { t } = useTranslation()
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-muted text-sm animate-pulse">{t('common.loading')}</div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const location = useLocation()
  const { data: wallets } = useWallets()
  const hasNoWallets = !wallets || wallets.length === 0
  const hideFab = shouldHideFab(location.pathname)

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile: Header + content + FAB + BottomNav */}
      <div className="md:hidden">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-4 pb-[calc(72px+env(safe-area-inset-bottom))]">
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </main>
        {!hideFab && (
          hasNoWallets ? (
            <button
              aria-label={t('transaction.createWalletFirst')}
              title={t('transaction.createWalletFirst')}
              className="fixed bottom-20 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-light opacity-40 cursor-not-allowed transition-all duration-150 z-40 pb-[env(safe-area-inset-bottom)]"
              disabled
            >
              +
            </button>
          ) : (
            <a
              href="/add"
              aria-label={t('transaction.addTransaction')}
              className="cta-glow fixed bottom-20 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-light transition-all duration-150 z-40 pb-[env(safe-area-inset-bottom)]"
            >
              +
            </a>
          )
        )}
        <BottomNav />
      </div>

      {/* Desktop: Sidebar + Header + content */}
      <div className="hidden md:flex">
        <Sidebar />
        <div className="flex-1 min-h-screen">
          <Header />
          <main className="max-w-7xl mx-auto px-6 py-6">
            <Suspense fallback={<PageLoader />}>
              {children}
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  )
}
