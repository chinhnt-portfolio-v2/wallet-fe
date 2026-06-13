import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/Skeleton'

interface ExportData {
  transactions: unknown[]
  wallets: unknown[]
  categories: unknown[]
}

interface ExportPreviewProps {
  data: ExportData | undefined
  isLoading: boolean
  filteredCount: number
  totalCount: number
}

function StatCell({ value, labelKey }: { value: number; labelKey: string }) {
  const { t } = useTranslation()
  return (
    <div className="text-center">
      <p className="text-xl font-extrabold text-ink tabular-nums">{value}</p>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mt-0.5">
        {t(labelKey)}
      </p>
    </div>
  )
}

/** Summary card: CSV format badge + stats grid. */
export function ExportPreview({ data, isLoading, filteredCount, totalCount }: ExportPreviewProps) {
  const { t } = useTranslation()

  return (
    <div className="bg-surface border border-line rounded-xl p-5 space-y-5">
      {/* Format row */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary-soft flex items-center justify-center shrink-0">
          <span className="text-sm font-extrabold text-primary tracking-tight">CSV</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-ink">{t('export.csvName')}</p>
          <p className="text-xs text-muted mt-0.5 leading-relaxed">{t('export.csvDesc')}</p>
        </div>
        {/* Selected count badge */}
        <div className="shrink-0 text-right">
          <p className="text-lg font-extrabold text-primary tabular-nums">{filteredCount}</p>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted">
            {t('export.transactions')}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      {isLoading && (
        <div className="grid grid-cols-3 gap-0 border-t border-line pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="text-center px-2">
              <Skeleton className="h-7 w-10 mx-auto mb-1" />
              <Skeleton className="h-2.5 w-16 mx-auto" />
            </div>
          ))}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-3 gap-0 border-t border-line pt-4 divide-x divide-line">
          <StatCell value={totalCount} labelKey="export.transactions" />
          <StatCell value={data.wallets.length} labelKey="export.wallets" />
          <StatCell value={data.categories.length} labelKey="export.categories" />
        </div>
      )}
    </div>
  )
}
