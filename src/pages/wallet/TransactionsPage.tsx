import { useState, useRef } from 'react'
import { useTransactions, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useTransactions'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { ListSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import type { TxnType } from '@/types'

const PAGE_SIZE = 20

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
      <span className="text-muted self-center text-xs">–</span>
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
    <Card className="space-y-4">
      <p className="text-sm font-semibold text-primary">{title}</p>
      <div className="flex gap-1 bg-surface-2 rounded-md p-1">
        {(['EXPENSE', 'INCOME'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTxType(t); setCategoryId(null) }}
            className={`flex-1 py-1.5 text-xs rounded-sm transition-colors ${
              txType === t
                ? t === 'EXPENSE' ? 'bg-negative text-white font-medium shadow-sm'
                  : 'bg-positive text-white font-medium shadow-sm'
                : 'text-muted hover:text-primary'
            }`}
          >
            {t === 'EXPENSE' ? '💸 Chi' : '📥 Thu'}
          </button>
        ))}
      </div>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="input text-xl font-bold font-mono pr-12 py-3"
          placeholder="0"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">₫</span>
      </div>
      {amount && (
        <p className="text-xs text-muted -mt-2">= {formatCurrency(parseFloat(amount) || 0)}</p>
      )}
      <div>
        <label className="block text-xs font-medium text-secondary mb-1.5">Ví</label>
        <select
          value={walletId ?? ''}
          onChange={(e) => setWalletId(Number(e.target.value) || null)}
          className="input"
        >
          <option value="">Chọn ví...</option>
          {wallets?.map((w) => (
            <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-secondary mb-1.5">Danh mục</label>
        <div className="flex flex-wrap gap-1.5">
          {filteredCategories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategoryId(categoryId === c.id ? null : c.id)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-all ${
                categoryId === c.id ? 'ring-2 ring-primary/40' : 'hover:opacity-80'
              }`}
              style={{
                backgroundColor: `${c.color}20`,
                border: `1.5px solid ${c.color}`,
                color: c.color,
              }}
            >
              <span>{c.icon}</span><span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>
      <Input
        label="Ghi chú"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="VD: Ăn trưa công ty"
      />
      <div>
        <label className="block text-xs font-medium text-secondary mb-1.5">Ngày</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input"
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">Hủy</Button>
        <Button onClick={handleSubmit} disabled={isPending || !walletId || !amount} className="flex-1">
          {isPending ? 'Đang lưu...' : 'Lưu'}
        </Button>
      </div>
    </Card>
  )
}

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
    <BottomSheet open onClose={onClose} title="Sửa giao dịch">
      <TransactionForm
        initial={tx}
        onSubmit={handleUpdate}
        onCancel={onClose}
        isPending={update.isPending}
        title="Chỉnh sửa"
      />
      <div className="border-t border-border pt-3 mt-3">
        {showDelete ? (
          <div className="space-y-2">
            <p className="text-xs text-negative text-center">
              Xóa giao dịch này? Hành động không thể hoàn tác.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDelete(false)} className="flex-1">Hủy</Button>
              <Button
                onClick={handleDelete}
                disabled={del.isPending}
                className="flex-1 !bg-negative !text-white"
              >
                {del.isPending ? 'Đang xóa...' : '🗑️ Xóa'}
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="w-full text-center text-xs text-negative hover:underline py-1"
          >
            🗑️ Xóa giao dịch
          </button>
        )}
      </div>
    </BottomSheet>
  )
}

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
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-primary">Giao dịch</h2>
        <p className="text-xs text-muted">
          {isLoading ? '...' : `${visibleCount} giao dịch`}
          {hasFilters && <span className="text-accent ml-1">(đang lọc)</span>}
        </p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Tìm giao dịch..."
            className="input pl-8 text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 py-2 rounded-md border text-sm transition-colors ${
            hasFilters
              ? 'border-accent text-accent bg-accent/10'
              : 'border-border text-muted hover:text-primary hover:border-accent/50'
          }`}
        >
          ⚙️
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card className="space-y-3">
          <p className="text-xs font-medium text-secondary">Bộ lọc</p>
          <div className="flex gap-1 bg-surface-2 rounded-md p-1">
            {['', 'INCOME', 'EXPENSE'].map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`flex-1 py-1.5 text-xs rounded-sm transition-colors ${
                  typeFilter === t
                    ? 'bg-surface shadow-sm font-medium text-primary'
                    : 'text-muted hover:text-primary'
                }`}
              >
                {t === '' ? 'Tất cả' : t === 'INCOME' ? '📥 Thu' : '💸 Chi'}
              </button>
            ))}
          </div>
          <div>
            <label className="block text-xs font-medium text-secondary mb-1.5">Khoảng ngày</label>
            <DateRangePicker
              dateFrom={dateFrom}
              dateTo={dateTo}
              onChange={(f, t) => { setDateFrom(f); setDateTo(t) }}
            />
          </div>
          {hasFilters && (
            <button
              onClick={() => {
                setTypeFilter(''); setDateFrom(''); setDateTo('')
                setSearch(''); setDebouncedSearch('')
              }}
              className="text-xs text-accent hover:underline"
            >
              ✕ Xóa bộ lọc
            </button>
          )}
        </Card>
      )}

      {/* List */}
      {isLoading ? (
        <ListSkeleton rows={8} />
      ) : error ? (
        <EmptyState icon="⚠️" title="Không tải được giao dịch" description="Hãy thử lại sau." />
      ) : Array.isArray(txs) && txs.length > 0 ? (
        <>
          <div className="bg-surface rounded-md border border-border divide-y divide-border">
            {txs.map((tx) => (
              <button
                key={tx.id}
                onClick={() => setEditTarget({
                  id: tx.id, walletId: tx.walletId, categoryId: tx.categoryId,
                  amount: tx.amount, type: tx.type, note: tx.note, date: tx.date,
                })}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface-2 transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: `${tx.category?.color ?? '#94A3B8'}20` }}
                >
                  {tx.category?.icon ?? '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {tx.category?.name ?? 'Giao dịch'}
                  </p>
                  <p className="text-2xs text-muted truncate">
                    {tx.wallet?.icon} {tx.wallet?.name}
                    {tx.note && ` · ${tx.note}`}
                    {tx.groupId && <span className="ml-1 text-accent">📑 Nợ</span>}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-semibold font-mono tabular-nums ${
                    tx.type === 'INCOME' ? 'text-positive' : 'text-negative'
                  }`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-2xs text-muted">{formatDate(tx.date)}</p>
                </div>
              </button>
            ))}
          </div>
          {visibleCount >= PAGE_SIZE && (
            <p className="text-center text-xs text-muted py-2">
              Hiển thị {PAGE_SIZE} giao dịch mới nhất
            </p>
          )}
        </>
      ) : (
        <EmptyState
          icon="📭"
          title="Không có giao dịch"
          description={hasFilters ? 'Thử thay đổi bộ lọc.' : 'Bắt đầu thêm giao dịch đầu tiên.'}
          action={
            !hasFilters ? (
              <a href="/add" className="bg-accent text-white text-xs px-4 py-2 rounded-md font-medium">
                Thêm giao dịch
              </a>
            ) : undefined
          }
        />
      )}

      {/* Edit modal — BottomSheet */}
      {editTarget && (
        <EditModal
          tx={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
