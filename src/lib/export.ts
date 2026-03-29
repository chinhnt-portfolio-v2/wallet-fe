import { useQuery } from '@tanstack/react-query'
import apiClient from '@/api/client'
import { formatCurrency } from '@/lib/utils'
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
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function transactionsToCSV(
  transactions: Transaction[],
  wallets: Wallet[],
  categories: Category[]
): string {
  const walletMap = new Map(wallets.map((w) => [w.id, w]))
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  const headers = ['Ngày', 'Loại', 'Số tiền (VND)', 'Ví', 'Danh mục', 'Ghi chú', 'Tạo lúc']
  const rows = transactions.map((tx) => {
    const wallet = walletMap.get(tx.walletId)
    const category = tx.categoryId ? categoryMap.get(tx.categoryId) : null
    return [
      tx.date,
      tx.type === 'EXPENSE' ? 'Chi' : 'Thu',
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

export function useExportTransactions() {
  return useQuery({
    queryKey: ['export-data'],
    queryFn: async () => {
      const [txsRes, walletsRes, catsRes] = await Promise.all([
        apiClient.get<Transaction[]>('/wallet/transactions'),
        apiClient.get<Wallet[]>('/wallet/wallets'),
        apiClient.get<Category[]>('/wallet/categories'),
      ])
      return {
        transactions: txsRes.data,
        wallets: walletsRes.data,
        categories: catsRes.data,
      }
    },
    staleTime: 0,
  })
}
