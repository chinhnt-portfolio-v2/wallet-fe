import { useState } from 'react'
import { toast } from 'sonner'
import { useExportTransactions, transactionsToCSV, downloadCSV } from '@/lib/export'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const PRESETS = [
  { label: 'Tất cả', days: null,       key: 'all' },
  { label: '7 ngày',  days: 7,           key: '7d'  },
  { label: '30 ngày', days: 30,         key: '30d' },
  { label: '90 ngày', days: 90,         key: '90d' },
  { label: 'Tháng này', days: null,     key: 'this-month' },
  { label: 'Tháng trước', days: null,  key: 'last-month' },
]

function getDateRange(key: string): { from: string; to: string } | null {
  const to = new Date()
  const toStr = to.toISOString().split('T')[0]

  switch (key) {
    case 'all': return null
    case '7d': {
      const d = new Date(); d.setDate(d.getDate() - 7)
      return { from: d.toISOString().split('T')[0], to: toStr }
    }
    case '30d': {
      const d = new Date(); d.setDate(d.getDate() - 30)
      return { from: d.toISOString().split('T')[0], to: toStr }
    }
    case '90d': {
      const d = new Date(); d.setDate(d.getDate() - 90)
      return { from: d.toISOString().split('T')[0], to: toStr }
    }
    case 'this-month': {
      const from = new Date(to.getFullYear(), to.getMonth(), 1).toISOString().split('T')[0]
      return { from, to: toStr }
    }
    case 'last-month': {
      const lastMonth = new Date(to.getFullYear(), to.getMonth() - 1, 1)
      const from = lastMonth.toISOString().split('T')[0]
      const toPrev = new Date(to.getFullYear(), to.getMonth(), 0).toISOString().split('T')[0]
      return { from, to: toPrev }
    }
    default: return null
  }
}

export default function ExportPage() {
  const [selectedPreset, setSelectedPreset] = useState('this-month')
  const [isExporting, setIsExporting] = useState(false)

  const { data, isLoading, refetch } = useExportTransactions()

  const handleExport = async () => {
    if (!data) { toast.error('Chưa có dữ liệu'); return }
    setIsExporting(true)
    try {
      let txs = data.transactions

      // Filter by date range if selected
      const range = getDateRange(selectedPreset)
      if (range) {
        txs = txs.filter((tx) => tx.date >= range.from && tx.date <= range.to)
      }

      if (txs.length === 0) {
        toast.error('Không có giao dịch nào trong khoảng thời gian này')
        setIsExporting(false)
        return
      }

      const csv = transactionsToCSV(txs, data.wallets, data.categories)
      const dateStr = new Date().toISOString().split('T')[0]
      downloadCSV(csv, `wallet-export-${dateStr}`)
      toast.success(`Đã xuất ${txs.length} giao dịch!`)
    } catch {
      toast.error('Lỗi khi xuất file')
    } finally {
      setIsExporting(false)
    }
  }

  const totalCount = data?.transactions.length ?? 0
  const range = getDateRange(selectedPreset)
  const filteredCount = range && data
    ? data.transactions.filter((tx) => tx.date >= range.from && tx.date <= range.to).length
    : totalCount

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">Xuất dữ liệu</h2>
        <p className="text-xs text-muted dark:text-dark-muted">Tải về file CSV cho Excel, Google Sheets</p>
      </div>

      {/* Info card */}
      <Card className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 dark:bg-dark-accent/20 flex items-center justify-center shrink-0">
            <span className="text-accent dark:text-dark-accent text-lg">📊</span>
          </div>
          <div>
            <p className="text-sm font-medium text-primary dark:text-dark-primary">Xuất CSV</p>
            <p className="text-xs text-muted dark:text-dark-muted mt-0.5">
              File CSV chứa: ngày, loại (chi/thu), số tiền, ví, danh mục, ghi chú.
              Mở được trên Excel, Google Sheets, Numbers.
            </p>
          </div>
        </div>

        {data && (
          <div className="flex gap-4 pt-2 border-t border-border dark:border-dark-border">
            <div className="text-center flex-1">
              <p className="text-xl font-bold font-mono text-primary dark:text-dark-primary">{totalCount}</p>
              <p className="text-xs text-muted dark:text-dark-muted">Tổng giao dịch</p>
            </div>
            <div className="text-center flex-1 border-x border-border dark:border-dark-border">
              <p className="text-xl font-bold font-mono text-primary dark:text-dark-primary">{data.wallets.length}</p>
              <p className="text-xs text-muted dark:text-dark-muted">Ví</p>
            </div>
            <div className="text-center flex-1">
              <p className="text-xl font-bold font-mono text-primary dark:text-dark-primary">{data.categories.length}</p>
              <p className="text-xs text-muted dark:text-dark-muted">Danh mục</p>
            </div>
          </div>
        )}
      </Card>

      {/* Date range selector */}
      <div>
        <label className="block text-xs font-medium text-secondary dark:text-dark-secondary mb-2">
          Khoảng thời gian
        </label>
        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => setSelectedPreset(p.key)}
              className={`py-2.5 text-xs rounded-md border transition-all font-medium ${
                selectedPreset === p.key
                  ? 'border-accent dark:border-dark-accent bg-accent/10 dark:bg-dark-accent/10 text-accent dark:text-dark-accent'
                  : 'border-border dark:border-dark-border text-muted dark:text-dark-muted hover:border-accent/50 dark:hover:border-dark-accent/50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {data && (
          <p className="text-xs text-muted dark:text-dark-muted mt-2">
            {range
              ? `${filteredCount} giao dịch (${range.from} → ${range.to})`
              : `${totalCount} giao dịch (tất cả)`}
          </p>
        )}
      </div>

      {/* Export button */}
      <Button
        onClick={handleExport}
        disabled={isExporting || isLoading || !data}
        className="w-full py-3"
      >
        {isExporting || isLoading
          ? 'Đang chuẩn bị...'
          : `📥 Tải file CSV (${data ? filteredCount : 0} giao dịch)`}
      </Button>

      {/* Note */}
      <p className="text-xs text-muted dark:text-dark-muted text-center">
        File có định dạng UTF-8, tương thích với Excel tiếng Việt.
      </p>
    </div>
  )
}
