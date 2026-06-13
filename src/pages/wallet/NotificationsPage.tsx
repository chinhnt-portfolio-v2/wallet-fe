import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { toast } from 'sonner'
import {
  getNotifications, markAllRead, clearNotifications,
  isPushEnabled, requestPermission, type AppNotification,
} from '@/lib/notifications'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionLabel, Pill } from '@/design-system'

// Notification type → short label i18n key.
const TYPE_LABEL_KEY: Record<AppNotification['type'], string> = {
  debt_reminder:  'notification.typeDebt',
  budget_warning: 'notification.typeBudget',
  recurring_due:  'notification.typeRecurring',
  system:         'notification.typeSystem',
}

const TYPE_HUES: Record<AppNotification['type'], string> = {
  debt_reminder: 'text-negative',
  budget_warning: 'text-warning',
  recurring_due:  'text-accent',
  system:         'text-muted',
}

function formatTime(iso: string, t: TFunction) {
  const d = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return t('notification.justNow')
  if (diffMin < 60) return t('notification.minutesAgo', { count: diffMin })
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return t('notification.hoursAgo', { count: diffH })
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [notifs, setNotifs] = useState<AppNotification[]>(getNotifications)
  const [pushEnabled, setPushEnabled] = useState(isPushEnabled())

  const unread = notifs.filter((n) => !n.read).length

  const handleMarkAll = () => {
    markAllRead()
    setNotifs(getNotifications())
  }

  const handleClear = () => {
    if (!confirm(t('notification.clearConfirm'))) return
    clearNotifications()
    setNotifs([])
  }

  const handleEnablePush = async () => {
    const result = await requestPermission()
    if (result === 'granted') {
      setPushEnabled(true)
      toast.success(t('notification.pushGranted'))
    } else if (result === 'denied') {
      toast.error(t('notification.pushDenied'))
    } else {
      toast.info(t('notification.pushDismissed'))
    }
  }

  return (
    <div className="page-enter space-y-5">
      {/* Header — one page-title recipe (serif italic + mono eyebrow) */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-0.5">{t('notification.subtitle')}</p>
          <h2 className="font-display italic text-2xl text-primary leading-tight">{t('notification.title')}</h2>
        </div>
        <div className="flex items-center gap-2">
          {notifs.length > 0 && (
            <>
              <Pill ghost onClick={handleMarkAll} className="text-[10px]">
                {t('notification.markAllRead')}
              </Pill>
              <Pill ghost onClick={handleClear} className="text-[10px] text-negative shadow-[inset_0_0_0_1px_rgb(var(--color-negative)/0.4)]">
                {t('notification.clearAll')}
              </Pill>
            </>
          )}
        </div>
      </div>

      {/* Push notification panel */}
      <section className="space-y-3">
        <SectionLabel right={pushEnabled ? t('notification.enabled') : t('notification.disabled')}>
          {t('notification.browserPush')}
        </SectionLabel>
        <div className="bg-surface border border-border rounded-lg p-4 flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 font-mono text-sm ${
            pushEnabled ? 'bg-positive/10 text-positive' : 'bg-warning/10 text-warning'
          }`}>
            {pushEnabled ? '✓' : '!'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-primary">{t('notification.browserPush')}</p>
            <p className="font-mono text-[11px] text-muted mt-0.5 leading-relaxed">
              {pushEnabled
                ? t('notification.pushEnabledDesc')
                : t('notification.pushDisabledDesc')}
            </p>
          </div>
          {!pushEnabled && (
            <Pill accent onClick={handleEnablePush} className="shrink-0 text-[10px]">
              {t('notification.enableNow')}
            </Pill>
          )}
        </div>
      </section>

      {/* Notification list */}
      <section className="space-y-3">
        <SectionLabel right={unread > 0 ? t('notification.unreadCount', { count: unread }) : t('notification.allRead')}>
          {t('notification.title')}
        </SectionLabel>

        {notifs.length === 0 ? (
          <div className="bg-surface border border-border rounded-lg">
            <EmptyState
              icon="🔔"
              title={t('notification.noNotifications')}
              description={t('notification.noNotificationsDesc')}
            />
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
                  {t(TYPE_LABEL_KEY[n.type])}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary leading-tight">{n.title}</p>
                  <p className="font-mono text-[11px] text-muted mt-0.5 leading-relaxed">{n.body}</p>
                </div>

                <span className="font-mono text-[10px] text-faint shrink-0 ml-2 mt-0.5">
                  {formatTime(n.createdAt, t)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
