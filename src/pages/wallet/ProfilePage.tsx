import { useAuthStore } from '@/stores/authStore'
import { useUser } from '@/hooks/useUser'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'

export default function ProfilePage() {
  const clearToken = useAuthStore((s) => s.clearToken)
  const { data: user, isLoading } = useUser()

  const handleLogout = () => {
    clearToken()
    localStorage.removeItem('wallet_theme')
    localStorage.removeItem('wallet_refresh_token')
    window.location.href = '/login'
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-primary">Cài đặt</h2>
        <p className="text-xs text-muted">Quản lý tài khoản</p>
      </div>

      {/* User card */}
      <Card className="space-y-0 divide-y divide-border">
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
                  className="w-12 h-12 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-xl text-accent font-bold">
                  {(user.name ?? user.email ?? '?')[0].toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-primary truncate">
                  {user.name ?? 'Chưa đặt tên'}
                </p>
                <p className="text-2xs text-muted truncate">{user.email}</p>
                <span className="inline-block mt-1 text-2xs px-2 py-0.5 rounded-full bg-surface-2 text-muted">
                  {user.provider === 'google' ? '🔵 Google' : user.provider}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-sm text-muted">
            Không tải được thông tin người dùng
          </div>
        )}

        {/* Settings */}
        <div className="p-1">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-3 text-sm text-negative hover:bg-surface-2 rounded-md transition-colors flex items-center justify-between"
          >
            <span>Đăng xuất</span>
            <span>→</span>
          </button>
        </div>
      </Card>

      {/* App info */}
      <Card padding="sm">
        <div className="space-y-1 text-center">
          <p className="text-xs font-medium text-primary">💰 Wallet App</p>
          <p className="text-2xs text-muted">Phiên bản 0.2.0</p>
        </div>
      </Card>
    </div>
  )
}
