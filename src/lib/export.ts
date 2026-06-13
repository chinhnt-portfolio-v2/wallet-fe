import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import type { Transaction, Wallet, Category } from '@/types'

export type ExportFormat = 'csv'

export interface ExportOptions {
  transactions: Transaction[]
  wallets: Wallet[]
  categories: Category[]
  filename?: string
}

function escapeCSV(value: string | number | null | undefined): string {
  const str = String(value ?? '')
  // Neutralize CSV formula injection: a field starting with = + - @ (or a
  // leading tab/CR) is treated as a formula by Excel/Sheets. Prefix with a
  // single quote so it renders as plain text.
  const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str
  if (safe.includes(',') || safe.includes('"') || safe.includes('\n')) {
    return `"${safe.replace(/"/g, '""')}"`
  }
  return safe
}

// Localized labels passed in from the calling component (so this pure helper
// stays free of i18n imports). Falls back to Vietnamese defaults if omitted.
export interface CsvLabels {
  headers: string[]
  expense: string
  income: string
}

const DEFAULT_CSV_LABELS: CsvLabels = {
  headers: ['Ngày', 'Loại', 'Số tiền (VND)', 'Ví', 'Danh mục', 'Ghi chú', 'Tạo lúc'],
  expense: 'Chi',
  income: 'Thu',
}

export function transactionsToCSV(
  transactions: Transaction[],
  wallets: Wallet[],
  categories: Category[],
  labels: CsvLabels = DEFAULT_CSV_LABELS
): string {
  const walletMap = new Map(wallets.map((w) => [w.id, w]))
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  const headers = labels.headers
  const rows = transactions.map((tx) => {
    const wallet = walletMap.get(tx.walletId)
    const category = tx.categoryId ? categoryMap.get(tx.categoryId) : null
    return [
      tx.date,
      tx.type === 'EXPENSE' ? labels.expense : labels.income,
      tx.amount,
      wallet?.name ?? '—',
      category ? `${category.icon} ${category.name}` : '—',
      tx.note ?? '',
      new Date(tx.createdAt).toLocaleString('vi-VN'),
    ]
  })

  const csvLines = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ]

  return csvLines.join('\n')
}

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Page size used while paginating the full transaction history for export.
const EXPORT_PAGE_SIZE = 200
// Safety cap to avoid an unbounded loop if the API never returns a short page.
const EXPORT_MAX_PAGES = 500

/**
 * F7: fetch EVERY transaction page (not just the first 20) so the exported CSV
 * contains the user's complete history. Stops when a page returns fewer rows
 * than the requested size, or when the safety cap is reached.
 */
async function fetchAllTransactions(): Promise<Transaction[]> {
  const all: Transaction[] = []
  for (let page = 0; page < EXPORT_MAX_PAGES; page++) {
    const res = await apiClient.get<Transaction[]>('/wallet/transactions', {
      params: { page, size: EXPORT_PAGE_SIZE },
    })
    const rows = Array.isArray(res.data) ? res.data : []
    all.push(...rows)
    if (rows.length < EXPORT_PAGE_SIZE) break
  }
  return all
}

export function useExportTransactions() {
  return useQuery({
    queryKey: ['export-data'],
    queryFn: async () => {
      const [transactions, walletsRes, catsRes] = await Promise.all([
        fetchAllTransactions(),
        apiClient.get<Wallet[]>('/wallet/wallets'),
        apiClient.get<Category[]>('/wallet/categories'),
      ])
      return {
        transactions,
        wallets: walletsRes.data,
        categories: catsRes.data,
      }
    },
    staleTime: 0,
  })
}
