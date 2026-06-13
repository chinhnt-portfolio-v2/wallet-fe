import { useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTransactions } from '@/hooks/useTransactions'
import { useCategories } from '@/hooks/useCategories'
import { useWallets } from '@/hooks/useWallets'
import { ListSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { TransactionRow } from '@/components/transactions/transaction-row'
import { TransactionTable } from '@/components/transactions/transaction-table'
import { TxSummaryTiles } from '@/components/transactions/tx-summary-tiles'
import { TxFilterBar } from '@/components/transactions/tx-filter-bar'
import { TxEditModal } from '@/components/transactions/tx-edit-modal'
import { DateRangePanel, DateGroupHeader } from '@/components/transactions/tx-date-group-header'
import type { Transaction, TxnType } from '@/types'

const PAGE_SIZE = 20

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // ── Filter state ──
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [walletFilter, setWalletFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showDatePanel, setShowDatePanel] = useState(false)
  const [editTarget, setEditTarget] = useState<{
    id: number; walletId: number; categoryId: number | null; amount: number;
    type: TxnType; note: string | null; date: string
  } | null>(null)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const resetPage = () => setPage(1)

  const handleSearchChange = (val: string) => {
    setSearch(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => { setDebouncedSearch(val); resetPage() }, 250)
  }

  const handleClear = () => {
    setTypeFilter(''); setDateFrom(''); setDateTo('')
    setCategoryFilter(''); setWalletFilter('')
    setSearch(''); setDebouncedSearch(''); resetPage()
  }

  const { data: rawTxs, isLoading, error, refetch } = useTransactions({
    type: typeFilter || undefined, size: PAGE_SIZE, page,
    categoryId: categoryFilter ? Number(categoryFilter) : undefined,
    walletId: walletFilter ? Number(walletFilter) : undefined,
    dateFrom: dateFrom || undefined, dateTo: dateTo || undefined,
    search: debouncedSearch || undefined,
  })

  const { data: categories } = useCategories()
  const { data: wallets } = useWallets()
  const categoryOptions = useMemo(() => [
    { value: '', label: t('transaction.allCategories') },
    ...(Array.isArray(categories) ? categories : []).map((c) => ({ value: String(c.id), label: c.name })),
  ], [categories, t])
  const walletOptions = useMemo(() => [
    { value: '', label: t('transaction.allWallets') },
    ...(Array.isArray(wallets) ? wallets : []).map((w) => ({ value: String(w.id), label: w.name })),
  ], [wallets, t])

  const txs: Transaction[] = useMemo(
    () => (Array.isArray(rawTxs) ? rawTxs : []),
    [rawTxs],
  )
  const hasNext = txs.length === PAGE_SIZE
  const hasFilters = !!(typeFilter || categoryFilter || walletFilter || dateFrom || dateTo || debouncedSearch)

  // Summary from current page
  const summary = useMemo(() => ({
    totalIncome: txs.filter((t) => t.type === 'INCOME').reduce((s, t) => s + t.amount, 0),
    totalExpense: txs.filter((t) => t.type === 'EXPENSE').reduce((s, t) => s + t.amount, 0),
  }), [txs])

  // Group by date (YYYY-MM-DD) for mobile list view
  const grouped = useMemo(() => {
    const map = new Map<string, Transaction[]>()
    txs.forEach((tx) => {
      const day = tx.date.slice(0, 10)
      if (!map.has(day)) map.set(day, [])
      map.get(day)!.push(tx)
    })
    return [...map.entries()]
  }, [txs])

  const openEdit = (tx: Transaction) => setEditTarget({
    id: tx.id, walletId: tx.walletId, categoryId: tx.categoryId,
    amount: tx.amount, type: tx.type, note: tx.note, date: tx.date,
  })

  return (
    <div className="page-enter space-y-0">
      {/* Page header */}
      <div className="pb-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-1">
          {t('transaction.activityLog')}
        </p>
        <h1 className="text-xl font-extrabold tracking-[-0.02em] text-ink leading-tight">
          {t('transaction.title')}
        </h1>
        <p className="text-[11px] text-muted mt-1">
          {isLoading ? '…' : t('transaction.entriesCount', { count: txs.length })}
          {hasFilters && <span className="text-primary ml-1.5">{t('transaction.filtered')}</span>}
        </p>
      </div>

      {/* Summary tiles */}
      {!isLoading && txs.length > 0 && (
        <>
          <TxSummaryTiles variant="mobile" data={summary} />
          <TxSummaryTiles variant="desktop" data={summary} />
        </>
      )}

      {/* Filter bar */}
      <div className="pb-3 border-b border-line">
        <TxFilterBar
          search={search} onSearchChange={handleSearchChange}
          typeFilter={typeFilter} onTypeChange={(v) => { setTypeFilter(v); resetPage() }}
          showDatePanel={showDatePanel} onToggleDatePanel={() => setShowDatePanel(!showDatePanel)}
          hasActiveFilters={hasFilters} onClear={handleClear}
          onExportCsv={() => navigate('/export')}
          onAddTransaction={() => navigate('/add')}
        />
      </div>

      {/* Filters panel — date range + category + wallet */}
      {showDatePanel && (
        <div className="space-y-3 pt-3">
          <DateRangePanel dateFrom={dateFrom} dateTo={dateTo}
            onChange={(f, to) => { setDateFrom(f); setDateTo(to); resetPage() }} />
          <div className="grid grid-cols-2 gap-2">
            <Select aria-label={t('transaction.categoryFilter')} value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); resetPage() }}
              options={categoryOptions} />
            <Select aria-label={t('transaction.walletFilter')} value={walletFilter}
              onChange={(e) => { setWalletFilter(e.target.value); resetPage() }}
              options={walletOptions} />
          </div>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="pt-4"><ListSkeleton rows={8} /></div>
      ) : error ? (
        <div className="pt-4">
          <EmptyState icon="⚠️" title={t('transaction.loadError')} description={t('wallet.tryAgainLater')}
            action={<button onClick={() => refetch()} className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-full border border-line text-sub text-[11px] uppercase tracking-[0.05em] hover:bg-hover transition-colors">{t('common.retry')}</button>}
          />
        </div>
      ) : txs.length > 0 ? (
        <>
          {/* Mobile: date-grouped list */}
          <div className="sm:hidden">
            {grouped.map(([day, rows]) => {
              const dayNet = rows.reduce((s, tx) => s + (tx.type === 'INCOME' ? tx.amount : -tx.amount), 0)
              return (
                <div key={day}>
                  <DateGroupHeader label={day} total={dayNet} />
                  {rows.map((tx, i) => (
                    <TransactionRow key={tx.id} tx={tx} first={i === 0} onEdit={() => openEdit(tx)} />
                  ))}
                </div>
              )
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block pt-2">
            <TransactionTable txs={txs} page={page} hasNext={hasNext}
              onEdit={openEdit}
              onPrev={() => setPage((p) => Math.max(1, p - 1))}
              onNext={() => setPage((p) => p + 1)}
            />
          </div>

          {/* Mobile pager footer */}
          {(page > 1 || hasNext) && (
            <div className="sm:hidden pt-4 flex items-center justify-between gap-3">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="text-[11px] uppercase tracking-[0.08em] px-3 h-10 min-h-[44px] rounded-lg border border-line text-sub hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                ← {t('transaction.prev')}
              </button>
              <span className="text-[11px] text-muted tabular-nums">{t('transaction.page', { page })}</span>
              <button onClick={() => setPage((p) => p + 1)} disabled={!hasNext}
                className="text-[11px] uppercase tracking-[0.08em] px-3 h-10 min-h-[44px] rounded-lg border border-line text-sub hover:bg-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                {t('transaction.nextPage')} →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="pt-4">
          <EmptyState
            icon="📋"
            title={page > 1 ? t('transaction.noMore') : t('transaction.noMatch')}
            description={page > 1 ? t('transaction.endOfList') : hasFilters ? t('transaction.tryChangingFilters') : t('transaction.startByAdding')}
            action={page > 1
              ? <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full border border-line text-sub text-[11px] uppercase tracking-[0.05em] hover:bg-hover transition-colors">← {t('transaction.previousPage')}</button>
              : !hasFilters
                ? <a href="/add" className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-primary text-primary-ink text-[11px] uppercase tracking-[0.05em] hover:bg-primary-hover transition-colors">{t('transaction.addTransaction')}</a>
                : undefined
            }
          />
        </div>
      )}

      {/* Edit modal */}
      {editTarget && <TxEditModal tx={editTarget} onClose={() => setEditTarget(null)} />}
    </div>
  )
}
