import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useExportTransactions, transactionsToCSV, downloadCSV } from '@/lib/export'
import { Button } from '@/components/ui/Button'
import { SectionLabel } from '@/design-system'

const PRESETS = [
  { labelKey: 'export.presetAll',       days: null, key: 'all'        },
  { labelKey: 'export.preset7d',        days: 7,    key: '7d'         },
  { labelKey: 'export.preset30d',       days: 30,   key: '30d'        },
  { labelKey: 'export.preset90d',       days: 90,   key: '90d'        },
  { labelKey: 'export.presetThisMonth', days: null, key: 'this-month' },
  { labelKey: 'export.presetLastMonth', days: null, key: 'last-month' },
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

// Render an ISO yyyy-mm-dd as dd/mm/yyyy (consistent with the rest of the app).
function fmtRange(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export default function ExportPage() {
  const { t } = useTranslation()
  const [selectedPreset, setSelectedPreset] = useState('this-month')
  const [isExporting, setIsExporting] = useState(false)

  const { data, isLoading } = useExportTransactions()

  const handleExport = async () => {
    if (!data) { toast.error(t('export.noData')); return }
    setIsExporting(true)
    try {
      let txs = data.transactions

      const range = getDateRange(selectedPreset)
      if (range) {
        txs = txs.filter((tx) => tx.date >= range.from && tx.date <= range.to)
      }

      if (txs.length === 0) {
        toast.error(t('export.noTxInRange'))
        setIsExporting(false)
        return
      }

      const csv = transactionsToCSV(txs, data.wallets, data.categories, {
        headers: [
          t('export.csvHeaderDate'), t('export.csvHeaderType'), t('export.csvHeaderAmount'),
          t('export.csvHeaderWallet'), t('export.csvHeaderCategory'), t('export.csvHeaderNote'),
          t('export.csvHeaderCreatedAt'),
        ],
        expense: t('export.csvExpense'),
        income: t('export.csvIncome'),
      })
      const dateStr = new Date().toISOString().split('T')[0]
      downloadCSV(csv, `wallet-export-${dateStr}`)
      toast.success(t('export.exported', { count: txs.length }))
    } catch {
      toast.error(t('export.exportError'))
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
    <div className="page-enter space-y-5">
      {/* Header */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-0.5">{t('export.subtitle')}</p>
        <h2 className="font-display italic text-[28px] leading-none text-primary">{t('export.title')}</h2>
      </div>

      {/* ── Format info panel ────────────────────────────── */}
      <section className="space-y-3">
        <SectionLabel>{t('export.format')}</SectionLabel>

        <div className="bg-surface border border-border rounded-lg p-4 space-y-4">
          {/* CSV format row */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <span className="font-mono text-[11px] font-bold text-accent">CSV</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary">{t('export.csvName')}</p>
              <p className="font-mono text-[11px] text-muted mt-0.5">
                {t('export.csvDesc')}
              </p>
            </div>
          </div>

          {/* Stats row */}
          {data && (
            <div className="grid grid-cols-3 gap-0 border-t border-border pt-4">
              <div className="text-center border-r border-border">
                <p className="font-mono text-xl font-bold text-primary">{totalCount}</p>
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted mt-0.5">{t('export.transactions')}</p>
              </div>
              <div className="text-center border-r border-border">
                <p className="font-mono text-xl font-bold text-primary">{data.wallets.length}</p>
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted mt-0.5">{t('export.wallets')}</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-xl font-bold text-primary">{data.categories.length}</p>
                <p className="font-mono text-[10px] uppercase tracking-wide text-muted mt-0.5">{t('export.categories')}</p>
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
              ? t('export.transactionsCount', { count: filteredCount })
              : t('export.transactionsCount', { count: totalCount })
            : undefined
        }>
          {t('export.dateRange')}
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
              {t(p.labelKey)}
            </button>
          ))}
        </div>

        {data && range && (
          <p className="font-mono text-[11px] text-muted">
            {fmtRange(range.from)} → {fmtRange(range.to)}
          </p>
        )}
      </section>

      {/* ── Export action ─────────────────────────────────── */}
      <section className="space-y-3">
        <SectionLabel>{t('export.download')}</SectionLabel>

        {/* Bone fill + ink text so the CTA label is legible (audit §2.11). */}
        <Button
          onClick={handleExport}
          disabled={isExporting || isLoading || !data}
          className="w-full min-h-[44px] py-3 font-mono text-[12px] uppercase tracking-[0.06em] !bg-[#f5f1e8] !text-[#0d0c0a] hover:!bg-[#e8e2d4] active:scale-[0.98]"
        >
          {isExporting || isLoading
            ? t('export.preparing')
            : t('export.downloadCsv', { count: data ? filteredCount : 0 })}
        </Button>

        <p className="font-mono text-[10px] text-faint text-center">
          {t('export.footnote')}
        </p>
      </section>
    </div>
  )
}
