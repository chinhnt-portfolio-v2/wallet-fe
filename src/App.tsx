import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { lazy } from 'react'
import { Toaster } from 'sonner'
import { AppShell } from '@/components/layout/app-shell'
import { OAuthCallbackHandler } from '@/components/auth/oauth-callback-handler'
import { ProtectedRoute } from '@/components/auth/protected-route'

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
const NotificationsPage = lazy(() => import('@/pages/wallet/NotificationsPage'))
const WishlistPage = lazy(() => import('@/pages/wallet/WishlistPage'))
const LoginPage = lazy(() => import('@/pages/wallet/LoginPage'))

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
})

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="bottom-center" richColors />
        <OAuthCallbackHandler />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Shell><DashboardPage /></Shell>} />
          <Route path="/transactions" element={<Shell><TransactionsPage /></Shell>} />
          <Route path="/add" element={<Shell><AddTransactionPage /></Shell>} />
          <Route path="/debts" element={<Shell><DebtGroupsPage /></Shell>} />
          <Route path="/debts/new" element={<Shell><CreateDebtGroupPage /></Shell>} />
          <Route path="/debts/:id" element={<Shell><DebtGroupDetailPage /></Shell>} />
          <Route path="/profile" element={<Shell><ProfilePage /></Shell>} />
          <Route path="/wallets" element={<Shell><WalletsPage /></Shell>} />
          <Route path="/wallets/transfer" element={<Shell><TransferPage /></Shell>} />
          <Route path="/categories" element={<Shell><CategoriesPage /></Shell>} />
          <Route path="/budgets" element={<Shell><BudgetsPage /></Shell>} />
          <Route path="/recurring" element={<Shell><RecurringPage /></Shell>} />
          <Route path="/export" element={<Shell><ExportPage /></Shell>} />
          <Route path="/notifications" element={<Shell><NotificationsPage /></Shell>} />
          <Route path="/wishlist" element={<Shell><WishlistPage /></Shell>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
