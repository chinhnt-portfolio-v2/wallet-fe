import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  getNotifications, markAllRead, clearNotifications,
  isPushEnabled, requestPermission, type AppNotification,
} from '@/lib/notifications'


const ICONS: Record<AppNotification['type'], string> = {
  debt_reminder: '📑',
  budget_warning: '📊',
  recurring_due:  '🔁',
  system:         '💡',
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin} phút trước`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH} giờ trước`
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const [notifs, setNotifs] = useState<AppNotification[]>(getNotifications)
  const [pushEnabled, setPushEnabled] = useState(isPushEnabled())

  const unread = notifs.filter((n) => !n.read).length

  const handleMarkAll = () => {
    markAllRead()
    setNotifs(getNotifications())
  }

  const handleClear = () => {
    if (!confirm('Xóa tất cả thông báo?')) return
    clearNotifications()
    setNotifs([])
  }

  const handleEnablePush = async () => {
    const result = await requestPermission()
    if (result === 'granted') {
      setPushEnabled(true)
      toast.success('Đã bật thông báo trình duyệt!')
    } else if (result === 'denied') {
      toast.error('Trình duyệt đã chặn thông báo. Vui lòng bật trong cài đặt trình duyệt.')
    } else {
      toast.info('Bạn đã từ chối. Bấm địa chỉ trình duyệt để bật lại.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">Thông báo</h2>
          <p className="text-xs text-muted dark:text-dark-muted">
            {unread > 0 ? `${unread} chưa đọc` : 'Tất cả đã đọc'}
          </p>
        </div>
        <div className="flex gap-2">
          {notifs.length > 0 && (
            <>
              <button onClick={handleMarkAll} className="text-xs text-accent dark:text-dark-accent hover:underline dark:hover:underline">
                Đánh dấu đã đọc
              </button>
              <button onClick={handleClear} className="text-xs text-negative dark:text-dark-negative hover:underline dark:hover:underline">
                Xóa tất cả
              </button>
            </>
          )}
        </div>
      </div>

      {/* Push notification permission */}
      <div className="card p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            pushEnabled ? 'bg-positive/10' : 'bg-warning/10'
          }`}>
            <span className="text-lg">{pushEnabled ? '🔔' : '🔕'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary dark:text-dark-primary">
              Thông báo trình duyệt
            </p>
            <p className="text-xs text-muted dark:text-dark-muted mt-0.5">
              {pushEnabled
                ? 'Đã bật — bạn sẽ nhận thông báo khi có nợ quá hạn hoặc đến hạn.'
                : 'Bật để nhận thông báo khi có nợ quá hạn hoặc đến hạn thanh toán.'}
            </p>
          </div>
        </div>
        {!pushEnabled && (
          <button
            onClick={handleEnablePush}
            className="w-full text-center text-xs text-accent dark:text-dark-accent hover:underline dark:hover:underline py-1"
          >
            Bật thông báo
          </button>
        )}
      </div>

      {/* Notification list */}
      {notifs.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-4xl">🔔</p>
          <p className="text-sm text-muted dark:text-dark-muted">Chưa có thông báo nào</p>
          <p className="text-xs text-muted dark:text-dark-muted">
            Thông báo sẽ xuất hiện khi có nợ quá hạn hoặc đến hạn thanh toán.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-md border border-border dark:border-dark-border bg-surface dark:bg-dark-surface cursor-pointer hover:bg-surface-2 dark:hover:bg-dark-surface-2 transition-colors ${
                !n.read ? 'border-l-2 border-l-accent dark:border-l-dark-accent' : 'opacity-70'
              }`}
              onClick={() => {
                if (n.link) navigate(n.link)
              }}
            >
              <div className="flex items-start gap-3">
                <span className="text-xl shrink-0">{ICONS[n.type]}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-primary dark:text-dark-primary leading-tight">
                      {n.title}
                    </p>
                    <p className="text-xs text-muted dark:text-dark-muted shrink-0 ml-2">
                      {formatTime(n.createdAt)}
                    </p>
                  </div>
                  <p className="text-xs text-muted dark:text-dark-muted mt-1 leading-relaxed">
                    {n.body}
                  </p>
                </div>
                {!n.read && (
                  <span className="w-2 h-2 bg-accent dark:bg-dark-accent rounded-full shrink-0 mt-1.5" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
