import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { toast } from 'sonner'
import {
  CreditCard, AlertTriangle, Repeat, Info, Bell, BellOff,
} from 'lucide-react'
import {
  getNotifications, markAllRead, clearNotifications,
  isPushEnabled, requestPermission, type AppNotification,
} from '@/lib/notifications'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionLabel, Pill } from '@/design-system'
import { useIsLg } from '@/hooks/use-media-query'

// ─── Type configs ─────────────────────────────────────────

interface TypeConfig {
  labelKey: string
  icon: React.ReactNode
  dotColor: string
  badgeBg: string
  badgeText: string
}

const TYPE_CONFIG: Record<AppNotification['type'], TypeConfig> = {
  debt_reminder: {
    labelKey: 'notification.typeDebt',
    icon: <CreditCard className="w-4 h-4" aria-hidden="true" />,
    dotColor: 'bg-warning',
    badgeBg: 'bg-warning-soft',
    badgeText: 'text-warning',
  },
  budget_warning: {
    labelKey: 'notification.typeBudget',
    icon: <AlertTriangle className="w-4 h-4" aria-hidden="true" />,
    dotColor: 'bg-negative',
    badgeBg: 'bg-negative-soft',
    badgeText: 'text-negative',
  },
  recurring_due: {
    labelKey: 'notification.typeRecurring',
    icon: <Repeat className="w-4 h-4" aria-hidden="true" />,
    dotColor: 'bg-positive',
    badgeBg: 'bg-positive-soft',
    badgeText: 'text-positive',
  },
  system: {
    labelKey: 'notification.typeSystem',
    icon: <Info className="w-4 h-4" aria-hidden="true" />,
    dotColor: 'bg-primary',
    badgeBg: 'bg-primary-soft',
    badgeText: 'text-primary',
  },
}

// ─── Helpers ──────────────────────────────────────────────

function isToday(iso: string): boolean {
  const d = new Date(iso)
  const now = new Date()
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  )
}

function formatTime(iso: string, t: TFunction): string {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const diffMin = Math.floor(diffMs / 60_000)
  if (diffMin < 1) return t('notification.justNow')
  if (diffMin < 60) return t('notification.minutesAgo', { count: diffMin })
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return t('notification.hoursAgo', { count: diffH })
  return d.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short' })
}

// ─── Sub-components ───────────────────────────────────────

function NotifRow({ n, onClick }: { n: AppNotification; onClick?: () => void }) {
  const { t } = useTranslation()
  const cfg = TYPE_CONFIG[n.type]

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      className={`relative flex items-start gap-3 px-4 py-3.5 transition-colors
        ${onClick ? 'cursor-pointer hover:bg-hover' : ''}
        ${!n.read ? '' : 'opacity-60'}`}
    >
      {/* Unread stripe */}
      {!n.read && (
        <span
          aria-label={t('notification.unread')}
          className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${cfg.dotColor}`}
        />
      )}

      {/* Type icon badge */}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.badgeBg} ${cfg.badgeText}`}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-extrabold uppercase tracking-[0.07em] ${cfg.badgeText}`}>
            {t(cfg.labelKey)}
          </span>
          {!n.read && (
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dotColor}`} aria-hidden="true" />
          )}
        </div>
        <p className="text-sm font-medium text-ink leading-snug">{n.title}</p>
        <p className="text-xs text-muted leading-relaxed">{n.body}</p>
      </div>

      {/* Timestamp */}
      <time
        dateTime={n.createdAt}
        aria-label={new Date(n.createdAt).toLocaleString()}
        className="text-[10px] text-muted shrink-0 mt-0.5"
      >
        {formatTime(n.createdAt, t)}
      </time>
    </div>
  )
}

function PushToggle({ enabled, onEnable }: { enabled: boolean; onEnable: () => void }) {
  const { t } = useTranslation()

  return (
    <div className="bg-surface border border-line rounded-xl p-4 flex items-center gap-4">
      {/* Icon */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        enabled ? 'bg-positive-soft text-positive' : 'bg-warning-soft text-warning'
      }`}>
        {enabled
          ? <Bell className="w-5 h-5" aria-hidden="true" />
          : <BellOff className="w-5 h-5" aria-hidden="true" />}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-ink">{t('notification.browserPush')}</p>
        <p className="text-xs text-muted mt-0.5 leading-relaxed">
          {enabled ? t('notification.pushEnabledDesc') : t('notification.pushDisabledDesc')}
        </p>
      </div>

      {/* Toggle switch */}
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={t('notification.browserPush')}
        onClick={enabled ? undefined : onEnable}
        disabled={enabled}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 min-w-[44px]
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
          @media (prefers-reduced-motion: reduce) { transition: none }
          ${enabled ? 'bg-primary cursor-default' : 'bg-surface-2 cursor-pointer hover:bg-hover'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
            ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
          aria-hidden="true"
        />
      </button>
    </div>
  )
}

function DesktopSettingsPanel({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4 w-72 shrink-0">
      <SectionLabel>{t('notification.settingsTitle')}</SectionLabel>
      {children}
      <p className="text-xs text-muted leading-relaxed px-1">
        {t('notification.settingsHint')}
      </p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [notifs, setNotifs] = useState<AppNotification[]>(getNotifications)
  const [pushEnabled, setPushEnabled] = useState(isPushEnabled())
  const isDesktop = useIsLg()

  const unread = notifs.filter((n) => !n.read).length
  const todayNotifs = notifs.filter((n) => isToday(n.createdAt))
  const earlierNotifs = notifs.filter((n) => !isToday(n.createdAt))

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
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-0.5">
            {t('notification.subtitle')}
          </p>
          <h1 className="text-xl font-extrabold tracking-[-0.02em] text-ink">
            {t('notification.title')}
          </h1>
        </div>
        {notifs.length > 0 && (
          <div className="flex items-center gap-2 pt-1 shrink-0">
            <Pill ghost onClick={handleMarkAll} className="text-[10px]">
              {t('notification.markAllRead')}
            </Pill>
            <Pill
              ghost
              onClick={handleClear}
              className="text-[10px] text-negative shadow-[inset_0_0_0_1px_rgb(var(--negative)/0.4)]"
            >
              {t('notification.clearAll')}
            </Pill>
          </div>
        )}
      </div>

      {/* Mobile: push banner — only shown when not on desktop */}
      {!isDesktop && (
        <div>
          <SectionLabel right={pushEnabled ? t('notification.enabled') : t('notification.disabled')}>
            {t('notification.browserPush')}
          </SectionLabel>
          <div className="mt-2">
            {/* Single PushToggle instance for mobile */}
            <PushToggle enabled={pushEnabled} onEnable={handleEnablePush} />
          </div>
        </div>
      )}

      {/* Two-column desktop layout */}
      <div className="flex gap-8 items-start">
        {/* ── Notification list ──────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-4">
          {notifs.length === 0 ? (
            <div className="bg-surface border border-line rounded-xl">
              <EmptyState
                icon="🔔"
                title={t('notification.noNotifications')}
                description={t('notification.noNotificationsDesc')}
              />
            </div>
          ) : (
            <>
              {/* Unread count badge */}
              {unread > 0 && (
                <SectionLabel right={t('notification.unreadCount', { count: unread })}>
                  {t('notification.title')}
                </SectionLabel>
              )}

              {/* Today group */}
              {todayNotifs.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted px-1">
                    {t('common.today')}
                  </p>
                  <div className="bg-surface border border-line rounded-xl overflow-hidden divide-y divide-line">
                    {todayNotifs.map((n) => (
                      <NotifRow
                        key={n.id}
                        n={n}
                        onClick={n.link ? () => navigate(n.link!) : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Earlier group */}
              {earlierNotifs.length > 0 && (
                <div className="space-y-1">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted px-1">
                    {t('notification.earlier')}
                  </p>
                  <div className="bg-surface border border-line rounded-xl overflow-hidden divide-y divide-line">
                    {earlierNotifs.map((n) => (
                      <NotifRow
                        key={n.id}
                        n={n}
                        onClick={n.link ? () => navigate(n.link!) : undefined}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Desktop settings sidebar — only shown on desktop; PushToggle rendered once here ── */}
        {isDesktop && (
          <DesktopSettingsPanel>
            <PushToggle enabled={pushEnabled} onEnable={handleEnablePush} />
          </DesktopSettingsPanel>
        )}
      </div>
    </div>
  )
}
