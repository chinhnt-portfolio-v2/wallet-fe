/**
 * Push Notification Service
 *
 * Uses Web Push API (browser native) for debt reminders.
 * Subscription stored in backend via apiClient.
 *
 * Flow:
 * 1. requestPermission() — ask user to grant notification permission
 * 2. subscribe() — get PushSubscription, send to backend
 * 3. checkDueDebts() — check open debts, fire browser notification if due
 *
 * Note: Real push delivery requires backend VAPID keys + web-push library.
 * This implementation provides in-app notifications + browser notifications
 * when permission is granted.
 */

const PUSH_ENDPOINT = '/api/v1/notifications/push'
const PERMISSION_KEY = 'wallet_push_permission'
const SUBSCRIPTION_KEY = 'wallet_push_subscription'

export type NotificationPermission = 'granted' | 'denied' | 'default' | 'prompt'

/** Check current notification permission */
export function getNotificationPermission(): NotificationPermission {
  if (!('Notification' in window)) return 'denied'
  return Notification.permission as NotificationPermission
}

/** Request browser notification permission */
export async function requestPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  const result = await Notification.requestPermission()
  localStorage.setItem(PERMISSION_KEY, result)
  return result as NotificationPermission
}

/** Check if push notifications are enabled */
export function isPushEnabled(): boolean {
  return getNotificationPermission() === 'granted'
}

/** Fire a browser notification (no backend needed for basic use) */
export function showNotification(title: string, options?: NotificationOptions) {
  if (!isPushEnabled()) return
  try {
    new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options,
    })
  } catch {
    // Notification failed (e.g., ServiceWorker context)
  }
}

/** Subscribe push — send subscription to backend */
export async function subscribePush(subscription: PushSubscription): Promise<boolean> {
  try {
    const raw = subscription.toJSON()
    await fetch(PUSH_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(raw),
    })
    localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(raw))
    return true
  } catch {
    return false
  }
}

/** Unsubscribe push — remove from backend */
export async function unsubscribePush(): Promise<void> {
  try {
    await fetch(PUSH_ENDPOINT, { method: 'DELETE' })
  } catch {
    // ignore
  }
  localStorage.removeItem(SUBSCRIPTION_KEY)
}

// ── In-app notification store ──────────────────────────────────
export interface AppNotification {
  id: string
  type: 'debt_reminder' | 'budget_warning' | 'recurring_due' | 'system'
  title: string
  body: string
  read: boolean
  createdAt: string
  link?: string
}

const NOTIFS_KEY = 'wallet_notifications'

export function getNotifications(): AppNotification[] {
  try {
    return JSON.parse(localStorage.getItem(NOTIFS_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function addNotification(n: Omit<AppNotification, 'id' | 'read' | 'createdAt'>): void {
  const notifs = getNotifications()
  notifs.unshift({
    ...n,
    id: crypto.randomUUID(),
    read: false,
    createdAt: new Date().toISOString(),
  })
  // Keep last 50
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs.slice(0, 50)))
}

export function markAllRead(): void {
  const notifs = getNotifications().map((n) => ({ ...n, read: true }))
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs))
}

export function clearNotifications(): void {
  localStorage.removeItem(NOTIFS_KEY)
}

// ── Debt due check ─────────────────────────────────────────────
export function checkDueDebts(groups: { id: number; title: string; dueDate: string | null; remaining: number }[]) {
  const today = new Date().toISOString().split('T')[0]
  const overdue = groups.filter((g) => g.dueDate && g.dueDate < today && g.remaining > 0)
  const dueToday = groups.filter((g) => g.dueDate === today && g.remaining > 0)

  if (overdue.length > 0) {
    addNotification({
      type: 'debt_reminder',
      title: '⚠️ Nợ đã quá hạn',
      body: `${overdue[0].title} đã quá hạn — ${overdue.length} khoản cần thanh toán`,
      link: '/debts',
    })
    showNotification('⚠️ Nợ đã quá hạn', {
      body: `${overdue[0].title} đã quá hạn! Nhấn để xem chi tiết.`,
      tag: 'debt-overdue',
    })
  }

  if (dueToday.length > 0) {
    addNotification({
      type: 'debt_reminder',
      title: '📑 Hạn thanh toán hôm nay',
      body: `${dueToday[0].title} — nhấn để thanh toán ngay`,
      link: `/debts/${dueToday[0].id}`,
    })
    showNotification('📑 Hạn thanh toán hôm nay', {
      body: `${dueToday[0].title} cần thanh toán hôm nay.`,
      tag: 'debt-due',
    })
  }
}
