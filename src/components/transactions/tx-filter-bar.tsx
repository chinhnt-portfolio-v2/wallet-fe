import { useTranslation } from 'react-i18next'
import { Search, SlidersHorizontal } from 'lucide-react'
import { SegmentedControl } from '@/components/ui/segmented-control'

interface TxFilterBarProps {
  /** Current search text */
  search: string
  onSearchChange: (val: string) => void
  /** 'INCOME' | 'EXPENSE' | '' (all) */
  typeFilter: string
  onTypeChange: (val: string) => void
  /** Whether the date filter panel is open */
  showDatePanel: boolean
  onToggleDatePanel: () => void
  hasActiveFilters: boolean
  onClear: () => void
  /** Desktop-only: CSV export handler */
  onExportCsv?: () => void
  /** Desktop-only: Add transaction handler */
  onAddTransaction?: () => void
}

/**
 * Transaction filter bar.
 * Mobile: search icon-button + Tất cả/Chi/Thu segmented + Tháng▾ icon-button.
 * Desktop: full search input + segmented + date toggle + "Xuất CSV" + "+ Thêm".
 */
export function TxFilterBar({
  search,
  onSearchChange,
  typeFilter,
  onTypeChange,
  showDatePanel,
  onToggleDatePanel,
  hasActiveFilters,
  onClear,
  onExportCsv,
  onAddTransaction,
}: TxFilterBarProps) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Search — full on desktop, icon-only toggle on mobile */}
      <div className="hidden sm:flex items-center gap-2 px-3 h-9 bg-surface rounded-lg border border-line min-w-[180px] flex-1 max-w-xs focus-within:border-primary transition-colors">
        <Search size={13} className="text-muted shrink-0" aria-hidden="true" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('transaction.searchMerchant')}
          aria-label={t('transaction.searchMerchant')}
          className="flex-1 bg-transparent border-none text-ink text-[12px] font-medium outline-none min-w-0 placeholder:text-muted"
        />
      </div>

      {/* Mobile search icon-button */}
      <button
        className="sm:hidden min-h-[44px] w-11 flex items-center justify-center rounded-lg border border-line bg-surface text-muted hover:bg-hover transition-colors"
        onClick={onToggleDatePanel}
        aria-label={t('transaction.searchMerchant')}
      >
        <Search size={16} />
      </button>

      {/* Type segmented — Tất cả / Chi / Thu */}
      <SegmentedControl
        size="sm"
        ariaLabel={t('transaction.typeFilter')}
        value={typeFilter}
        onChange={onTypeChange}
        options={[
          { value: '', label: t('transaction.all') },
          { value: 'EXPENSE', label: t('transaction.expenseShort') },
          { value: 'INCOME', label: t('transaction.incomeShort') },
        ]}
      />

      {/* Date filter toggle */}
      <button
        onClick={onToggleDatePanel}
        aria-pressed={showDatePanel}
        aria-label={t('transaction.dateRange')}
        className={`min-h-[44px] sm:min-h-0 sm:h-9 flex items-center gap-1.5 px-3 rounded-lg border text-[11px] font-semibold transition-colors ${
          showDatePanel
            ? 'border-primary bg-primary-soft text-primary'
            : 'border-line bg-surface text-sub hover:bg-hover'
        }`}
      >
        <SlidersHorizontal size={13} aria-hidden="true" />
        <span className="hidden sm:inline">{t('transaction.dateRange')}</span>
      </button>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-primary hover:underline min-h-[44px] sm:min-h-0 px-2"
        >
          ✕ {t('transaction.clear')}
        </button>
      )}

      {/* Desktop-only actions */}
      {onExportCsv && (
        <button
          onClick={onExportCsv}
          className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg border border-line text-[11px] font-semibold text-sub hover:bg-hover transition-colors ml-auto"
        >
          {t('transaction.exportCsv')}
        </button>
      )}
      {onAddTransaction && (
        <button
          onClick={onAddTransaction}
          className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-lg bg-primary text-primary-ink text-[11px] font-semibold hover:bg-primary-hover transition-colors shadow-button"
        >
          + {t('transaction.addTransaction')}
        </button>
      )}
    </div>
  )
}
