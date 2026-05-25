import { Suspense } from 'react'
import { useWallets } from '@/hooks/useWallets'
import { Header } from '@/components/layout/header'
import { BottomNav } from '@/components/layout/bottom-nav'
import { Sidebar } from '@/components/layout/sidebar'

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-muted text-sm animate-pulse">Loading...</div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { data: wallets } = useWallets()
  const hasNoWallets = !wallets || wallets.length === 0

  return (
    <div className="min-h-screen bg-bg">
      {/* Mobile: Header + content + FAB + BottomNav */}
      <div className="md:hidden">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-4 pb-24">
          <Suspense fallback={<PageLoader />}>
            {children}
          </Suspense>
        </main>
        {hasNoWallets ? (
          <button
            aria-label="Tạo ví trước khi thêm giao dịch"
            title="Tạo ví trước khi thêm giao dịch"
            className="fixed bottom-20 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-light opacity-40 cursor-not-allowed transition-all duration-150 z-40 pb-[env(safe-area-inset-bottom)]"
            disabled
          >
            +
          </button>
        ) : (
          <a
            href="/add"
            aria-label="Thêm giao dịch"
            className="fixed bottom-20 right-6 w-14 h-14 bg-accent text-white rounded-full shadow-lg flex items-center justify-center text-2xl font-light hover:bg-accent/90 active:scale-95 transition-all duration-150 z-40 pb-[env(safe-area-inset-bottom)]"
          >
            +
          </a>
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
