import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function ProfilePage() {
  const navigate = useNavigate()
  const { clearTokens } = useAuthStore()

  const handleLogout = () => {
    clearTokens()
    localStorage.removeItem('wallet_theme')
    window.location.href = '/login'
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-primary">Cài đặt</h2>
        <p className="text-xs text-muted">Quản lý tài khoản</p>
      </div>

      <Card className="space-y-1">
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-3 text-sm text-negative hover:bg-surface-2 rounded-md transition-colors flex items-center justify-between"
        >
          <span>Đăng xuất</span>
          <span>→</span>
        </button>
      </Card>

      <Card padding="sm">
        <p className="text-2xs text-muted text-center">
          Wallet App v0.1.0
        </p>
      </Card>
    </div>
  )
}
