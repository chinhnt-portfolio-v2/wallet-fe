import { useState } from 'react'
import { toast } from 'sonner'
import { useExportTransactions, transactionsToCSV, downloadCSV } from '@/lib/export'
import { Button } from '@/components/ui/Button'
import { SectionLabel } from '@/design-system'

const PRESETS = [
  { label: 'Tất cả',       days: null, key: 'all'        },
  { label: '7 ngày',       days: 7,    key: '7d'         },
  { label: '30 ngày',      days: 30,   key: '30d'        },
  { label: '90 ngày',      days: 90,   key: '90d'        },
  { label: 'Tháng này',    days: null, key: 'this-month' },
  { label: 'Tháng trước',  days: null, key: 'last-month' },
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
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-0.5">Account / Export</p>
        <h2 className="text-base font-semibold text-primary">Xuất dữ liệu</h2>
      </div>

      {/* ── Format info panel ────────────────────────────── */}
      <section className="space-y-3">
        <SectionLabel>Format</SectionLabel>

        <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
          {/* CSV format row */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <span className="font-mono text-[11px] font-bold text-accent">CSV</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary">Comma-separated values</p>
              <p className="font-mono text-[11px] text-muted mt-0.5">
                Ngày · Loại · Số tiền · Ví · Danh mục · Ghi chú — UTF-8, Excel compatible
              </p>
            </div>
          </div>

          {/* Stats row */}
          {data && (
            <div className="grid grid-cols-3 gap-0 border-t border-border pt-4">
              <div className="text-center border-r border-border">
                <p className="font-mono text-xl font-bold text-primary">{totalCount}</p>
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted mt-0.5">Giao dịch</p>
              </div>
              <div className="text-center border-r border-border">
                <p className="font-mono text-xl font-bold text-primary">{data.wallets.length}</p>
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted mt-0.5">Ví</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-xl font-bold text-primary">{data.categories.length}</p>
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted mt-0.5">Danh mục</p>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-3 gap-0 border-t border-border pt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="text-center">
                  <div className="h-6 w-10 mx-auto bg-surface-2 rounded animate-pulse mb-1" />
                  <div className="h-2.5 w-16 mx-auto bg-surface-2 rounded animate-pulse" />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Date range selector ───────────────────────────── */}
      <section className="space-y-3">
        <SectionLabel right={
          data
            ? range
              ? `${filteredCount} giao dịch`
              : `${totalCount} giao dịch`
            : undefined
        }>
          Khoảng thời gian
        </SectionLabel>

        <div className="grid grid-cols-3 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => setSelectedPreset(p.key)}
              className={`py-2.5 font-mono text-[11px] uppercase tracking-wide rounded-lg border transition-all ${
                selectedPreset === p.key
                  ? 'border-accent bg-accent/10 text-accent'
                  : 'border-border bg-surface text-muted hover:border-border-hi hover:text-primary'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {data && range && (
          <p className="font-mono text-[11px] text-muted">
            {range.from} → {range.to}
          </p>
        )}
      </section>

      {/* ── Export action ─────────────────────────────────── */}
      <section className="space-y-3">
        <SectionLabel>Download</SectionLabel>

        <Button
          onClick={handleExport}
          disabled={isExporting || isLoading || !data}
          className="w-full py-3 font-mono text-[12px] uppercase tracking-[0.06em]"
        >
          {isExporting || isLoading
            ? 'Đang chuẩn bị...'
            : `Tải file CSV · ${data ? filteredCount : 0} giao dịch`}
        </Button>

        <p className="font-mono text-[10px] text-faint text-center">
          UTF-8 · tương thích Excel tiếng Việt · Google Sheets · Numbers
        </p>
      </section>
    </div>
  )
}
