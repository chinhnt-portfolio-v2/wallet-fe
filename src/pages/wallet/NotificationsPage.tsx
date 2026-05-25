import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
  getNotifications, markAllRead, clearNotifications,
  isPushEnabled, requestPermission, type AppNotification,
} from '@/lib/notifications'
import { SectionLabel, Pill } from '@/design-system'

const TYPE_LABELS: Record<AppNotification['type'], string> = {
  debt_reminder: 'Debt',
  budget_warning: 'Budget',
  recurring_due:  'Recurring',
  system:         'System',
}

const TYPE_HUES: Record<AppNotification['type'], string> = {
  debt_reminder: 'text-negative',
  budget_warning: 'text-warning',
  recurring_due:  'text-accent',
  system:         'text-muted',
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return 'Vừa xong'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
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
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-0.5">Account / Alerts</p>
          <h2 className="text-base font-semibold text-primary">Thông báo</h2>
        </div>
        <div className="flex items-center gap-2">
          {notifs.length > 0 && (
            <>
              <Pill ghost onClick={handleMarkAll} className="text-[10px]">
                Đã đọc tất cả
              </Pill>
              <Pill ghost onClick={handleClear} className="text-[10px] text-negative shadow-[inset_0_0_0_1px_rgb(var(--color-negative)/0.4)]">
                Xóa tất cả
              </Pill>
            </>
          )}
        </div>
      </div>

      {/* Push notification panel */}
      <section className="space-y-3">
        <SectionLabel right={pushEnabled ? 'Enabled' : 'Disabled'}>
          Browser push
        </SectionLabel>
        <div className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-mono text-sm ${
            pushEnabled ? 'bg-positive/10 text-positive' : 'bg-warning/10 text-warning'
          }`}>
            {pushEnabled ? '✓' : '!'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary">Thông báo trình duyệt</p>
            <p className="font-mono text-[11px] text-muted mt-0.5 leading-relaxed">
              {pushEnabled
                ? 'Đã bật — nhận thông báo nợ quá hạn và đến hạn.'
                : 'Bật để nhận cảnh báo nợ và thanh toán đến hạn.'}
            </p>
          </div>
          {!pushEnabled && (
            <Pill accent onClick={handleEnablePush} className="shrink-0 text-[10px]">
              Bật ngay
            </Pill>
          )}
        </div>
      </section>

      {/* Notification list */}
      <section className="space-y-3">
        <SectionLabel right={unread > 0 ? `${unread} chưa đọc` : 'Tất cả đã đọc'}>
          Thông báo
        </SectionLabel>

        {notifs.length === 0 ? (
          <div className="bg-surface border border-border rounded-lg p-8 text-center space-y-2">
            <p className="font-mono text-[11px] text-muted">Chưa có thông báo nào</p>
            <p className="font-mono text-[11px] text-faint">
              Thông báo sẽ xuất hiện khi có nợ quá hạn hoặc đến hạn.
            </p>
          </div>
        ) : (
          <div className="bg-surface border border-border rounded-lg divide-y divide-border overflow-hidden">
            {notifs.map((n) => (
              <div
                key={n.id}
                onClick={() => { if (n.link) navigate(n.link) }}
                className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-surface-2 transition-colors ${
                  n.link ? 'cursor-pointer' : ''
                } ${!n.read ? 'bg-surface' : 'opacity-60'}`}
              >
                {/* Unread indicator stripe */}
                <div className={`w-0.5 self-stretch rounded-full shrink-0 ${
                  !n.read ? 'bg-accent' : 'bg-transparent'
                }`} />

                {/* Type badge */}
                <span className={`font-mono text-[10px] uppercase tracking-wide shrink-0 mt-0.5 ${TYPE_HUES[n.type]}`}>
                  {TYPE_LABELS[n.type]}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary leading-tight">{n.title}</p>
                  <p className="font-mono text-[11px] text-muted mt-0.5 leading-relaxed">{n.body}</p>
                </div>

                <span className="font-mono text-[10px] text-faint shrink-0 ml-2 mt-0.5">
                  {formatTime(n.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
