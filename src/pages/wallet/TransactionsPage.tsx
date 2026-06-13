import { useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useTransactions, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useTransactions'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { ListSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { TransactionRow } from '@/components/transactions/transaction-row'
import { ymdToInstant, isoToInputDate, todayYmd } from '@/lib/date-utils'
import { toast } from 'sonner'
import {
  Amount,
  SectionLabel,
  CategoryChip,
  Pill,
} from '@/design-system'
import type { TxnType } from '@/types'

const PAGE_SIZE = 20

// ─── Date range picker ────────────────────────────────────────────────────────
function DateRangePicker({
  dateFrom,
  dateTo,
  onChange,
}: {
  dateFrom: string
  dateTo: string
  onChange: (from: string, to: string) => void
}) {
  const { t } = useTranslation()
  return (
    <div className="flex gap-2">
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onChange(e.target.value, dateTo)}
        className="input text-xs flex-1"
        title={t('transaction.fromDate')}
      />
      <span className="text-muted self-center text-xs font-mono">–</span>
      <input
        type="date"
        value={dateTo}
        onChange={(e) => onChange(dateFrom, e.target.value)}
        className="input text-xs flex-1"
        title={t('transaction.toDate')}
      />
    </div>
  )
}

// ─── Transaction form (edit modal inner) ─────────────────────────────────────
function TransactionForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
  title,
}: {
  initial?: {
    id?: number
    walletId: number
    categoryId?: number | null
    amount: number
    type: TxnType
    note?: string | null
    date?: string
  }
  onSubmit: (data: {
    walletId: number
    categoryId?: number
    amount: number
    type: TxnType
    note?: string
    date?: string
  }) => void
  onCancel: () => void
  isPending: boolean
  title: string
}) {
  const { t } = useTranslation()
  const [txType, setTxType] = useState<TxnType>(initial?.type ?? 'EXPENSE')
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '')
  const [walletId, setWalletId] = useState<number | null>(initial?.walletId ?? null)
  const [categoryId, setCategoryId] = useState<number | null>(initial?.categoryId ?? null)
  const [note, setNote] = useState(initial?.note ?? '')
  const [date, setDate] = useState(
    initial?.date ? isoToInputDate(initial.date) : todayYmd()
  )

  const { data: wallets } = useWallets()
  const { data: categories } = useCategories()
  const filteredCategories = categories?.filter((c) => c.type === txType) ?? []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletId || !amount) { toast.error(t('transaction.selectWalletAndAmount')); return }
    onSubmit({
      walletId,
      categoryId: categoryId ?? undefined,
      amount: parseFloat(amount),
      type: txType,
      note: note || undefined,
      // F8: persist the edited date as an ISO instant (BE honors it post-P1).
      date: ymdToInstant(date),
    })
  }

  return (
    <div className="space-y-4 p-4 bg-surface rounded-[var(--radius-lg)] border border-border">
      {/* title */}
      <SectionLabel>{title}</SectionLabel>

      {/* type tabs */}
      <div className="flex gap-1 bg-bg-2 rounded-[var(--radius-md)] p-[3px] border border-border">
        {(['EXPENSE', 'INCOME'] as const).map((tt) => (
          <button
            key={tt}
            type="button"
            onClick={() => { setTxType(tt); setCategoryId(null) }}
            className={`flex-1 h-8 rounded-[8px] font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
              txType === tt
                ? 'bg-surface-3 text-primary shadow-[inset_0_0_0_1px_var(--color-border-hi)]'
                : 'text-muted hover:text-primary'
            }`}
          >
            {tt === 'EXPENSE' ? t('transaction.expense') : t('transaction.income')}
          </button>
        ))}
      </div>

      {/* amount */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-2">{t('transaction.amountLabel')}</div>
        <div className="relative">
          <input
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full h-12 px-3 pr-14 rounded-[var(--radius-md)] border border-border bg-bg-2 text-primary font-mono text-2xl outline-none focus:border-border-hi tabular-nums"
            placeholder="0"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted">VND</span>
        </div>
        {amount && (
          <div className="mt-1.5 font-mono text-[11px] text-muted">
            = <Amount value={parseFloat(amount) || 0} size={11} />
          </div>
        )}
      </div>

      {/* wallet */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-2">{t('transaction.wallet')}</div>
        <select
          value={walletId ?? ''}
          onChange={(e) => setWalletId(Number(e.target.value) || null)}
          className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-border bg-bg-2 text-primary font-sans text-sm outline-none appearance-none"
        >
          <option value="">{t('transaction.selectWalletOption')}</option>
          {wallets?.map((w) => (
            <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
          ))}
        </select>
      </div>

      {/* category */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-2">{t('transaction.category')}</div>
        <div className="flex flex-wrap gap-2">
          {filteredCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(categoryId === c.id ? null : c.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-[8px] border transition-colors font-sans text-xs ${
                categoryId === c.id
                  ? 'border-accent bg-accent/10 text-primary'
                  : 'border-border bg-surface text-secondary hover:border-border-hi'
              }`}
            >
              <CategoryChip cat={c.name.toLowerCase()} name={c.name} size={18} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* note */}
      <Input
        label={t('transaction.merchantNote')}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder={t('transaction.notePlaceholderExpense')}
      />

      {/* date */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-2">{t('transaction.date')}</div>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-border bg-bg-2 text-primary font-mono text-sm outline-none"
          style={{ colorScheme: 'dark' }}
        />
      </div>

      {/* actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="outline" onClick={onCancel} className="flex-1">{t('common.cancel')}</Button>
        <Button onClick={handleSubmit} disabled={isPending || !walletId || !amount} className="flex-1">
          {isPending ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </div>
  )
}

// ─── Edit modal ───────────────────────────────────────────────────────────────
function EditModal({
  tx,
  onClose,
}: {
  tx: {
    id: number
    walletId: number
    categoryId: number | null
    amount: number
    type: TxnType
    note: string | null
    date: string
  }
  onClose: () => void
}) {
  const { t } = useTranslation()
  const update = useUpdateTransaction()
  const del    = useDeleteTransaction()
  const [showDelete, setShowDelete] = useState(false)

  const handleUpdate = (data: {
    walletId: number; categoryId?: number; amount: number; type: TxnType; note?: string; date?: string
  }) => {
    update.mutate({ id: tx.id, ...data }, {
      onSuccess: () => { toast.success(t('transaction.updated')); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handleDelete = () => {
    del.mutate(tx.id, {
      onSuccess: () => { toast.success(t('transaction.deleted')); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  return (
    <BottomSheet open onClose={onClose} title={t('transaction.editTransaction')}>
      <TransactionForm
        initial={tx}
        onSubmit={handleUpdate}
        onCancel={onClose}
        isPending={update.isPending}
        title={t('transaction.editTransaction')}
      />
      <div className="border-t border-border pt-4 mt-4">
        {showDelete ? (
          <div className="space-y-3">
            <p className="font-mono text-[11px] text-negative text-center uppercase tracking-[0.08em]">
              {t('transaction.deleteTransactionConfirm')}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDelete(false)} className="flex-1">{t('common.cancel')}</Button>
              <Button
                onClick={handleDelete}
                disabled={del.isPending}
                className="flex-1 !bg-negative !text-white"
              >
                {del.isPending ? t('common.deleting') : t('common.delete')}
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="w-full text-center font-mono text-[11px] uppercase tracking-[0.08em] text-negative hover:underline py-1"
          >
            {t('transaction.deleteTransaction')}
          </button>
        )}
      </div>
    </BottomSheet>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const { t } = useTranslation()
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')
  const [search, setSearch]     = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editTarget, setEditTarget] = useState<{
    id: number; walletId: number; categoryId: number | null; amount: number;
    type: TxnType; note: string | null; date: string
  } | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // F4: request exactly PAGE_SIZE rows. The backend paginates by offset
  // (page * size), so a "+1 probe" would shift the offset and skip a row.
  // Instead: a full page (length === PAGE_SIZE) means a next page may exist.
  const { data: rawTxs, isLoading, error, refetch } = useTransactions({
    type: typeFilter || undefined,
    size: PAGE_SIZE,
    page,
    dateFrom: dateFrom || undefined,
    dateTo:   dateTo   || undefined,
    search:   debouncedSearch || undefined,
  })

  const txs = Array.isArray(rawTxs) ? rawTxs : []
  const hasNext = txs.length === PAGE_SIZE
  const visibleCount = txs.length

  // Reset to page 1 whenever a filter changes so the user never lands on an empty page.
  const resetPage = () => setPage(1)

  const handleSearchChange = (val: string) => {
    setSearch(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => { setDebouncedSearch(val); resetPage() }, 250)
  }

  const hasFilters = !!(typeFilter || dateFrom || dateTo || debouncedSearch)

  return (
    <div className="page-enter space-y-0">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="px-0 pb-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted mb-1">
          ◇ {t('transaction.activityLog')}
        </div>
        <h2 className="font-display italic text-[28px] leading-none text-primary">
          {t('transaction.title')}
        </h2>
        <p className="font-mono text-[11px] text-muted mt-1.5">
          {isLoading ? '…' : t('transaction.entriesCount', { count: visibleCount })}
          {hasFilters && <span className="text-accent ml-1.5">{t('transaction.filtered')}</span>}
        </p>
      </div>

      {/* ── Filter bar ───────────────────────────────────────────────── */}
      <div className="pb-3 border-b border-border flex items-center gap-2 flex-wrap">
        {/* search */}
        <div className="flex items-center gap-2 px-3 h-[30px] bg-surface rounded-[7px] border border-border min-w-[200px] flex-1 max-w-sm">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" className="text-muted shrink-0">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('transaction.searchMerchant')}
            className="flex-1 bg-transparent border-none text-primary font-sans text-[12px] outline-none min-w-0 placeholder:text-faint"
          />
        </div>

        {/* divider */}
        <div className="h-5 w-px bg-border hidden sm:block" />

        {/* type label */}
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint hidden sm:block">{t('transaction.typeFilter')}</span>

        {/* type filter — unified segmented control (audit §3 / checklist 19) */}
        <SegmentedControl
          size="sm"
          ariaLabel={t('transaction.typeFilter')}
          value={typeFilter}
          onChange={(v) => { setTypeFilter(v); resetPage() }}
          options={[
            { value: '', label: t('transaction.all') },
            { value: 'INCOME', label: t('transaction.income') },
            { value: 'EXPENSE', label: t('transaction.expense') },
          ]}
        />

        {/* date range toggle */}
        <div className="h-5 w-px bg-border" />
        <Pill
          ghost={!showFilters}
          accent={showFilters}
          onClick={() => setShowFilters(!showFilters)}
        >
          {t('transaction.dateRange')}
        </Pill>

        {/* clear */}
        {hasFilters && (
          <>
            <div className="h-5 w-px bg-border" />
            <button
              onClick={() => {
                setTypeFilter(''); setDateFrom(''); setDateTo('')
                setSearch(''); setDebouncedSearch(''); resetPage()
              }}
              className="font-mono text-[10px] uppercase tracking-[0.08em] text-accent hover:underline"
            >
              ✕ {t('transaction.clear')}
            </button>
          </>
        )}
      </div>

      {/* ── Date range panel ─────────────────────────────────────────── */}
      {showFilters && (
        <div className="pt-3 pb-4 border-b border-border">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-2">{t('transaction.dateRange')}</div>
          <DateRangePicker
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={(f, t) => { setDateFrom(f); setDateTo(t); resetPage() }}
          />
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="pt-4"><ListSkeleton rows={8} /></div>
      ) : error ? (
        <div className="pt-4">
          <EmptyState
            icon="⚠️"
            title={t('transaction.loadError')}
            description={t('wallet.tryAgainLater')}
            action={
              <button
                onClick={() => refetch()}
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 rounded-full border border-border text-secondary font-mono text-[11px] uppercase tracking-[0.05em] hover:border-border-hi transition-colors"
              >
                {t('common.retry')}
              </button>
            }
          />
        </div>
      ) : Array.isArray(txs) && txs.length > 0 ? (
        <>
          {/* column headers (desktop only) */}
          <div className="hidden sm:grid gap-3 pt-3 pb-2 px-0 border-b border-border bg-bg-2"
               style={{ gridTemplateColumns: '100px 1fr 120px 110px' }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{t('transaction.colDate')}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{t('transaction.colMerchant')}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">{t('transaction.category')}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint text-right">{t('transaction.colAmount')}</span>
          </div>

          {/* rows — responsive (mobile cards / desktop grid) */}
          <div className="border-t border-border sm:border-t-0">
            {txs.map((tx, i) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                first={i === 0}
                onEdit={() => setEditTarget({
                  id: tx.id, walletId: tx.walletId, categoryId: tx.categoryId,
                  amount: tx.amount, type: tx.type, note: tx.note, date: tx.date,
                })}
              />
            ))}
          </div>

          {/* ── Pager ──────────────────────────────────────────────── */}
          {(page > 1 || hasNext) && (
            <div className="pt-4 flex items-center justify-between gap-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="font-mono text-[11px] uppercase tracking-[0.08em] px-3 h-8 rounded-[7px] border border-border text-secondary hover:border-border-hi disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ← {t('transaction.prev')}
              </button>
              <span className="font-mono text-[11px] text-muted tabular-nums">
                {t('transaction.page', { page })}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
                className="font-mono text-[11px] uppercase tracking-[0.08em] px-3 h-8 rounded-[7px] border border-border text-secondary hover:border-border-hi disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                {t('transaction.nextPage')} →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="pt-4">
          <EmptyState
            icon="◇"
            title={page > 1 ? t('transaction.noMore') : t('transaction.noMatch')}
            description={
              page > 1
                ? t('transaction.endOfList')
                : hasFilters
                  ? t('transaction.tryChangingFilters')
                  : t('transaction.startByAdding')
            }
            action={
              page > 1 ? (
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full border border-border text-secondary font-mono text-[11px] uppercase tracking-[0.05em] hover:border-border-hi transition-colors"
                >
                  ← {t('transaction.previousPage')}
                </button>
              ) : !hasFilters ? (
                <a href="/add" className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-accent text-accent-ink font-mono text-[11px] uppercase tracking-[0.05em]">
                  {t('transaction.addTransaction')}
                </a>
              ) : undefined
            }
          />
        </div>
      )}

      {/* ── Edit modal ───────────────────────────────────────────────── */}
      {editTarget && (
        <EditModal
          tx={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
