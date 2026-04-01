import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/authStore'
import { useUser } from '@/hooks/useUser'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ProfilePage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const clearToken = useAuthStore((s) => s.clearToken)
  const { data: user, isLoading, isError } = useUser()

  const handleLogout = () => {
    clearToken()
    localStorage.removeItem('wallet_theme')
    localStorage.removeItem('wallet_refresh_token')
    localStorage.removeItem('wallet_onboarding_done')
    window.location.href = '/login'
  }

  const menuItems = [
    { label: 'Xuất dữ liệu CSV', icon: '📥', href: '/export' },
    { label: 'Giao dịch định kỳ', icon: '🔁', href: '/recurring' },
    { label: 'Ngân sách', icon: '📊', href: '/budgets' },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">Cài đặt</h2>
        <p className="text-xs text-muted dark:text-dark-muted">Quản lý tài khoản</p>
      </div>

      {/* User card */}
      <Card className="divide-y divide-border dark:divide-dark-border">
        {isLoading ? (
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          </div>
        ) : user ? (
          <div className="p-4">
            <div className="flex items-center gap-3">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name ?? 'Avatar'}
                  className="w-12 h-12 rounded-full object-cover border-2 border-border dark:border-dark-border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-accent/20 dark:bg-dark-accent/20 flex items-center justify-center text-xl text-accent dark:text-dark-accent font-bold">
                  {(user.name ?? user.email ?? '?')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary dark:text-dark-primary truncate">
                  {user.name ?? 'Chưa đặt tên'}
                </p>
                <p className="text-xs text-muted dark:text-dark-muted truncate">{user.email}</p>
                <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-surface-2 dark:bg-dark-surface-2 text-muted dark:text-dark-muted">
                  {user.provider === 'google' ? '🔵 Google' : user.provider}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-negative dark:text-dark-negative space-y-2">
            {isError ? (
              <>
                <p>Đã xảy ra lỗi khi tải thông tin.</p>
                <button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['user-profile'] })}
                  className="text-xs underline hover:no-underline dark:hover:no-underline"
                >
                  Thử lại
                </button>
              </>
            ) : (
              <p className="text-muted dark:text-dark-muted">Không tải được thông tin người dùng</p>
            )}
          </div>
        )}

        {/* Menu links */}
        <div className="p-1 divide-y divide-border dark:divide-dark-border">
          {menuItems.map((item) => (
            <button
              key={item.href}
              onClick={() => navigate(item.href)}
              className="w-full text-left px-3 py-3 text-sm text-primary dark:text-dark-primary hover:bg-surface-2 dark:hover:bg-dark-surface-2 transition-colors flex items-center justify-between"
            >
              <span className="flex items-center gap-3">
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </span>
              <span className="text-muted dark:text-dark-muted">→</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <div className="p-1">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-3 text-sm text-negative dark:text-dark-negative hover:bg-negative/5 dark:hover:bg-dark-negative/10 transition-colors flex items-center justify-between"
          >
            <span>Đăng xuất</span>
            <span>→</span>
          </button>
        </div>
      </Card>

      {/* App info */}
      <Card padding="sm">
        <div className="space-y-1 text-center">
          <p className="text-xs font-medium text-primary dark:text-dark-primary">💰 Wallet</p>
          <p className="text-xs text-muted dark:text-dark-muted">Phiên bản 0.3.0</p>
        </div>
      </Card>
    </div>
  )
}
