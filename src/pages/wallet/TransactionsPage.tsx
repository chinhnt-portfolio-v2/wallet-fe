import { useState, useRef } from 'react'
import { useTransactions, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useTransactions'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { ListSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { formatDate } from '@/lib/utils'
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
  return (
    <div className="flex gap-2">
      <input
        type="date"
        value={dateFrom}
        onChange={(e) => onChange(e.target.value, dateTo)}
        className="input text-xs flex-1"
        title="Từ ngày"
      />
      <span className="text-muted self-center text-xs font-mono">–</span>
      <input
        type="date"
        value={dateTo}
        onChange={(e) => onChange(dateFrom, e.target.value)}
        className="input text-xs flex-1"
        title="Đến ngày"
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
  const [txType, setTxType] = useState<TxnType>(initial?.type ?? 'EXPENSE')
  const [amount, setAmount] = useState(initial?.amount?.toString() ?? '')
  const [walletId, setWalletId] = useState<number | null>(initial?.walletId ?? null)
  const [categoryId, setCategoryId] = useState<number | null>(initial?.categoryId ?? null)
  const [note, setNote] = useState(initial?.note ?? '')
  const [date, setDate] = useState(
    initial?.date ? initial.date.split('T')[0] : new Date().toISOString().split('T')[0]
  )

  const { data: wallets } = useWallets()
  const { data: categories } = useCategories()
  const filteredCategories = categories?.filter((c) => c.type === txType) ?? []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletId || !amount) { toast.error('Chọn ví và nhập số tiền'); return }
    onSubmit({
      walletId,
      categoryId: categoryId ?? undefined,
      amount: parseFloat(amount),
      type: txType,
      note: note || undefined,
      date: date || undefined,
    })
  }

  return (
    <div className="space-y-4 p-4 bg-surface rounded-[var(--radius-lg)] border border-border">
      {/* title */}
      <SectionLabel>{title}</SectionLabel>

      {/* type tabs */}
      <div className="flex gap-1 bg-bg-2 rounded-[var(--radius-md)] p-[3px] border border-border">
        {(['EXPENSE', 'INCOME'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTxType(t); setCategoryId(null) }}
            className={`flex-1 h-8 rounded-[8px] font-mono text-[11px] uppercase tracking-[0.1em] transition-colors ${
              txType === t
                ? 'bg-surface-3 text-primary shadow-[inset_0_0_0_1px_var(--color-border-hi)]'
                : 'text-muted hover:text-primary'
            }`}
          >
            {t === 'EXPENSE' ? 'Expense' : 'Income'}
          </button>
        ))}
      </div>

      {/* amount */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-2">Amount</div>
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
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-2">Wallet</div>
        <select
          value={walletId ?? ''}
          onChange={(e) => setWalletId(Number(e.target.value) || null)}
          className="w-full h-10 px-3 rounded-[var(--radius-md)] border border-border bg-bg-2 text-primary font-sans text-sm outline-none appearance-none"
        >
          <option value="">Select wallet…</option>
          {wallets?.map((w) => (
            <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
          ))}
        </select>
      </div>

      {/* category */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-2">Category</div>
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
        label="Merchant / note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="e.g. Pizza 4Ps, Grab, rent…"
      />

      {/* date */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-2">Date</div>
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
        <Button variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button onClick={handleSubmit} disabled={isPending || !walletId || !amount} className="flex-1">
          {isPending ? 'Saving…' : 'Save'}
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
  const update = useUpdateTransaction()
  const del    = useDeleteTransaction()
  const [showDelete, setShowDelete] = useState(false)

  const handleUpdate = (data: {
    walletId: number; categoryId?: number; amount: number; type: TxnType; note?: string; date?: string
  }) => {
    update.mutate({ id: tx.id, ...data }, {
      onSuccess: () => { toast.success('Đã cập nhật!'); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handleDelete = () => {
    del.mutate(tx.id, {
      onSuccess: () => { toast.success('Đã xóa giao dịch'); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  return (
    <BottomSheet open onClose={onClose} title="Edit transaction">
      <TransactionForm
        initial={tx}
        onSubmit={handleUpdate}
        onCancel={onClose}
        isPending={update.isPending}
        title="Edit transaction"
      />
      <div className="border-t border-border pt-4 mt-4">
        {showDelete ? (
          <div className="space-y-3">
            <p className="font-mono text-[11px] text-negative text-center uppercase tracking-[0.08em]">
              Delete this transaction? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDelete(false)} className="flex-1">Cancel</Button>
              <Button
                onClick={handleDelete}
                disabled={del.isPending}
                className="flex-1 !bg-negative !text-white"
              >
                {del.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="w-full text-center font-mono text-[11px] uppercase tracking-[0.08em] text-negative hover:underline py-1"
          >
            Delete transaction
          </button>
        )}
      </div>
    </BottomSheet>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]     = useState('')
  const [search, setSearch]     = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [page]     = useState(1)
  const [editTarget, setEditTarget] = useState<{
    id: number; walletId: number; categoryId: number | null; amount: number;
    type: TxnType; note: string | null; date: string
  } | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data: txs, isLoading, error } = useTransactions({
    type: typeFilter || undefined,
    size: PAGE_SIZE,
    page,
    dateFrom: dateFrom || undefined,
    dateTo:   dateTo   || undefined,
    search:   debouncedSearch || undefined,
  })

  const visibleCount = Array.isArray(txs) ? txs.length : 0

  const handleSearchChange = (val: string) => {
    setSearch(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setDebouncedSearch(val), 250)
  }

  const hasFilters = !!(typeFilter || dateFrom || dateTo || debouncedSearch)

  return (
    <div className="space-y-0">
      {/* ── Page header ──────────────────────────────────────────────── */}
      <div className="px-0 pb-5">
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted mb-1">
          ◇ Activity log
        </div>
        <h2 className="font-display italic text-[28px] leading-none text-primary">
          Transactions
        </h2>
        <p className="font-mono text-[11px] text-muted mt-1.5">
          {isLoading ? '…' : `${visibleCount} entries`}
          {hasFilters && <span className="text-accent ml-1.5">(filtered)</span>}
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
            placeholder="Search merchant…"
            className="flex-1 bg-transparent border-none text-primary font-sans text-[12px] outline-none min-w-0 placeholder:text-faint"
          />
        </div>

        {/* divider */}
        <div className="h-5 w-px bg-border hidden sm:block" />

        {/* type label */}
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-faint hidden sm:block">Type</span>

        {/* type pills */}
        <div className="flex gap-1">
          {(['', 'INCOME', 'EXPENSE'] as const).map((t) => (
            <Pill
              key={t}
              accent={typeFilter === t}
              ghost={typeFilter !== t}
              onClick={() => setTypeFilter(t)}
            >
              {t === '' ? 'All' : t === 'INCOME' ? 'Income' : 'Expense'}
            </Pill>
          ))}
        </div>

        {/* date range toggle */}
        <div className="h-5 w-px bg-border" />
        <Pill
          ghost={!showFilters}
          accent={showFilters}
          onClick={() => setShowFilters(!showFilters)}
        >
          Date range
        </Pill>

        {/* clear */}
        {hasFilters && (
          <>
            <div className="h-5 w-px bg-border" />
            <button
              onClick={() => {
                setTypeFilter(''); setDateFrom(''); setDateTo('')
                setSearch(''); setDebouncedSearch('')
              }}
              className="font-mono text-[10px] uppercase tracking-[0.08em] text-accent hover:underline"
            >
              ✕ Clear
            </button>
          </>
        )}
      </div>

      {/* ── Date range panel ─────────────────────────────────────────── */}
      {showFilters && (
        <div className="pt-3 pb-4 border-b border-border">
          <div className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted mb-2">Date range</div>
          <DateRangePicker
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={(f, t) => { setDateFrom(f); setDateTo(t) }}
          />
        </div>
      )}

      {/* ── Table ────────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="pt-4"><ListSkeleton rows={8} /></div>
      ) : error ? (
        <div className="pt-4">
          <EmptyState icon="⚠️" title="Không tải được giao dịch" description="Hãy thử lại sau." />
        </div>
      ) : Array.isArray(txs) && txs.length > 0 ? (
        <>
          {/* column headers */}
          <div className="grid gap-3 pt-3 pb-2 px-0 border-b border-border bg-bg-2"
               style={{ gridTemplateColumns: '100px 1fr 120px 110px' }}>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Date</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Merchant</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint">Category</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-faint text-right">Amount</span>
          </div>

          {/* rows */}
          <div>
            {txs.map((tx, i) => {
              const isIncome = tx.type === 'INCOME'
              return (
                <button
                  key={tx.id}
                  onClick={() => setEditTarget({
                    id: tx.id, walletId: tx.walletId, categoryId: tx.categoryId,
                    amount: tx.amount, type: tx.type, note: tx.note, date: tx.date,
                  })}
                  className="w-full grid gap-3 px-0 py-3 text-left hover:bg-surface-2 transition-colors group"
                  style={{
                    gridTemplateColumns: '100px 1fr 120px 110px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--color-border)',
                  }}
                >
                  {/* date column */}
                  <div className="flex flex-col justify-center min-w-0">
                    <span className="font-mono text-[11px] text-secondary tabular-nums">
                      {formatDate(tx.date)}
                    </span>
                  </div>

                  {/* merchant + wallet */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    {isIncome ? (
                      <div className="w-[22px] h-[22px] rounded-[5px] bg-accent/15 text-accent flex items-center justify-center font-mono text-[12px] shrink-0">
                        ↓
                      </div>
                    ) : (
                      <CategoryChip
                        cat={tx.category?.name?.toLowerCase() ?? 'other'}
                        name={tx.category?.name ?? 'Other'}
                        size={22}
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-sans text-[13px] text-primary truncate leading-tight">
                        {tx.category?.name ?? (isIncome ? 'Income' : 'Transaction')}
                        {tx.note && (
                          <span className="text-muted ml-1.5 text-[11px]">· {tx.note}</span>
                        )}
                      </p>
                      <p className="font-mono text-[10px] text-faint truncate mt-0.5">
                        {tx.wallet?.icon} {tx.wallet?.name}
                        {tx.groupId && <span className="ml-1.5 text-accent">◈ BNPL</span>}
                      </p>
                    </div>
                  </div>

                  {/* category label */}
                  <div className="flex items-center min-w-0">
                    <span className="font-mono text-[11px] text-muted truncate">
                      {isIncome ? '— income' : (tx.category?.name ?? '—')}
                    </span>
                  </div>

                  {/* amount */}
                  <div className="flex items-center justify-end">
                    <Amount
                      value={isIncome ? tx.amount : -tx.amount}
                      size={13}
                      weight={500}
                      className={isIncome ? 'text-positive' : 'text-primary'}
                    />
                  </div>
                </button>
              )
            })}
          </div>

          {visibleCount >= PAGE_SIZE && (
            <div className="pt-4 text-center font-mono text-[11px] text-muted">
              Showing {PAGE_SIZE} most recent · Refine filters to narrow down
            </div>
          )}
        </>
      ) : (
        <div className="pt-4">
          <EmptyState
            icon="◇"
            title="No transactions match"
            description={hasFilters ? 'Try changing filters.' : 'Start by adding your first transaction.'}
            action={
              !hasFilters ? (
                <a href="/add" className="inline-flex items-center gap-1.5 h-7 px-3 rounded-full bg-accent text-accent-ink font-mono text-[11px] uppercase tracking-[0.05em]">
                  Add transaction
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
