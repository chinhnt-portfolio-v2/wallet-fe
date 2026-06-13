import i18n from '@/i18n'
import { isoToInputDate, todayYmd } from '@/lib/date-utils'

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

const VND = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/** Full VND string with the ₫ symbol, vi-VN grouping ("1.234.567 ₫"). */
export function formatCurrency(amount: number): string {
  return VND.format(amount)
}

const VND_DIGITS = new Intl.NumberFormat('vi-VN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

/**
 * Grouped VND digits only (vi-VN dots), no currency symbol or sign.
 * For atoms that render the ₫ glyph separately (e.g. `Amount`).
 */
export function formatVndDigits(amount: number): string {
  return VND_DIGITS.format(Math.abs(Math.round(amount)))
}

/** Locale for date formatting — driven by the active i18n language. */
function dateLocale(): string {
  return i18n.language?.startsWith('en') ? 'en-US' : 'vi-VN'
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const txDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (txDate.getTime() === today.getTime()) return i18n.t('common.today')
  if (txDate.getTime() === yesterday.getTime()) return i18n.t('common.yesterday')
  return d.toLocaleDateString(dateLocale(), { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false
  // Calendar-day compare (lexicographic YYYY-MM-DD): a debt is overdue only
  // AFTER its due date, not on it — matching relDue's "due today" semantics.
  return isoToInputDate(dateStr) < todayYmd()
}

// Wallet/debt label maps were removed in the i18n migration (Phase 03):
// resolve labels via `t('wallet.types.<type>')`, `t('debt.types.<type>')`,
// `t('debt.status.<status>')` at the call sites instead of these constants.
