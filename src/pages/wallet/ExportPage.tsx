import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import { toast } from 'sonner'
import { useExportTransactions, transactionsToCSV, downloadCSV } from '@/lib/export'
import { SectionLabel } from '@/design-system'
import { DateRangePresets, getDateRange, PRESETS } from './date-range-presets'
import { ExportPreview } from './export-preview'

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
      downloadCSV(csv, `wallet-export-${new Date().toISOString().split('T')[0]}`)
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

  // Find selected preset label for accessible button text
  const selectedLabel = PRESETS.find((p) => p.key === selectedPreset)
  const downloadLabel = isExporting || isLoading
    ? t('export.preparing')
    : t('export.downloadCsv', { count: data ? filteredCount : 0 })

  return (
    <div className="page-enter space-y-6">
      {/* Header */}
      <div>
        <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-0.5">
          {t('export.subtitle')}
        </p>
        <h1 className="text-xl font-extrabold tracking-[-0.02em] text-ink">{t('export.title')}</h1>
      </div>

      {/* ── Format + preview ─────────────────────────────── */}
      <section className="space-y-2">
        <SectionLabel>{t('export.format')}</SectionLabel>
        <ExportPreview
          data={data}
          isLoading={isLoading}
          filteredCount={filteredCount}
          totalCount={totalCount}
        />
      </section>

      {/* ── Date range selector ───────────────────────────── */}
      <section className="space-y-2">
        <SectionLabel right={
          data
            ? t('export.transactionsCount', { count: filteredCount })
            : undefined
        }>
          {t('export.dateRange')}
        </SectionLabel>

        <DateRangePresets
          selected={selectedPreset}
          onSelect={setSelectedPreset}
          range={range}
        />
      </section>

      {/* ── Download CTA ──────────────────────────────────── */}
      <section className="space-y-3">
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting || isLoading || !data}
          aria-label={selectedLabel ? `${downloadLabel} — ${t(selectedLabel.labelKey)}` : downloadLabel}
          className="w-full flex items-center justify-center gap-2.5 min-h-[48px] px-5 py-3
                     bg-primary text-primary-ink text-sm font-semibold rounded-xl
                     hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors shadow-button active:scale-[.98]"
        >
          {!(isExporting || isLoading) && (
            <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
          )}
          {isExporting || isLoading ? (
            <span className="animate-pulse">{t('export.preparing')}</span>
          ) : (
            t('export.downloadCsv', { count: data ? filteredCount : 0 })
          )}
        </button>

        <p className="text-[10px] text-muted text-center">
          {t('export.footnote')}
        </p>
      </section>
    </div>
  )
}
