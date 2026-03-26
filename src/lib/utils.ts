export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

const VND = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatCurrency(amount: number): string {
  return VND.format(amount)
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const txDate = new Date(d.getFullYear(), d.getMonth(), d.getDate())

  if (txDate.getTime() === today.getTime()) return 'Hôm nay'
  if (txDate.getTime() === yesterday.getTime()) return 'Hôm qua'
  return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function isOverdue(dateStr: string | null): boolean {
  if (!dateStr) return false
  return new Date(dateStr) < new Date()
}

export const WALLET_TYPE_LABEL: Record<string, string> = {
  CASH: 'Tiền mặt',
  BANK: 'Ngân hàng',
  E_WALLET: 'Ví điện tử',
  POSTPAID: 'Trả sau',
}

export const GROUP_TYPE_LABEL: Record<string, string> = {
  BNPL: 'Mua trả sau',
  DEBT: 'Vay nợ',
  LOAN_GIVEN: 'Cho vay',
  PURCHASE_CREDIT: 'Mua chịu',
}

export const GROUP_STATUS_LABEL: Record<string, string> = {
  OPEN: 'Đang nợ',
  PARTIAL: 'Trả một phần',
  SETTLED: 'Đã thanh toán',
}
