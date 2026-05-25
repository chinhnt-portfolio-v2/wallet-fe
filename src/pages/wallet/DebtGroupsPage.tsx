import { useState } from 'react'
import { useDebtGroups, useUpdateDebtGroup, useDeleteDebtGroup } from '@/hooks/useDebtGroups'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Input } from '@/components/ui/Input'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Amount, SectionLabel, Pill } from '@/design-system'
import { formatDate, isOverdue, GROUP_TYPE_LABEL, GROUP_STATUS_LABEL } from '@/lib/utils'
import { toast } from 'sonner'
import type { DebtGroup } from '@/types'

// ── helpers ──────────────────────────────────────────────────────────────────

const KIND_MAP: Record<string, string> = {
  BNPL:            'BNPL',
  DEBT:            'Friend / Family',
  LOAN_GIVEN:      'Loan given',
  PURCHASE_CREDIT: 'Credit',
}

// Map groupType → display bucket for section grouping
const SECTION_ORDER = ['PURCHASE_CREDIT', 'BNPL', 'DEBT', 'LOAN_GIVEN']
const SECTION_LABEL: Record<string, string> = {
  PURCHASE_CREDIT: 'Credit',
  BNPL:            'Buy now, pay later',
  DEBT:            'Friend / Family',
  LOAN_GIVEN:      'Loan given',
}

function relDue(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  const diff = Math.round((new Date(dateStr).getTime() - Date.now()) / 86_400_000)
  if (diff < 0)  return `${Math.abs(diff)}d overdue`
  if (diff === 0) return 'due today'
  if (diff < 7)  return `${diff}d left`
  if (diff < 30) return `${Math.round(diff / 7)}w left`
  return `${Math.round(diff / 30)}mo left`
}

// ── form (shared between Create inline-edit and EditModal) ───────────────────

const GROUP_TYPES = [
  { value: 'BNPL',            label: 'BNPL',         desc: 'Buy now pay later' },
  { value: 'DEBT',            label: 'Vay nợ',        desc: 'Vay / được vay' },
  { value: 'LOAN_GIVEN',      label: 'Cho vay',      desc: 'Cho người khác vay' },
  { value: 'PURCHASE_CREDIT', label: 'Mua chịu',     desc: 'Credit / chịu' },
]

function GroupForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: { id?: number; title: string; groupType: DebtGroup['groupType']; totalAmount: number; dueDate?: string | null; counterparty?: string | null }
  onSubmit: (data: { id?: number; title: string; groupType: DebtGroup['groupType']; totalAmount: number; dueDate?: string; counterparty?: string }) => void
  onCancel: () => void
  isPending: boolean
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [groupType, setGroupType] = useState<DebtGroup['groupType']>(initial?.groupType ?? 'DEBT')
  const [totalAmount, setTotalAmount] = useState(initial?.totalAmount?.toString() ?? '')
  const [dueDate, setDueDate] = useState(initial?.dueDate ? initial.dueDate.split('T')[0] : '')
  const [counterparty, setCounterparty] = useState(initial?.counterparty ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { toast.error('Nhập tên khoản nợ'); return }
    if (!totalAmount)  { toast.error('Nhập số tiền'); return }
    onSubmit({
      title: title.trim(),
      groupType,
      totalAmount: parseFloat(totalAmount),
      dueDate: dueDate || undefined,
      counterparty: counterparty || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* type grid */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-2">Loại</p>
        <div className="grid grid-cols-2 gap-2">
          {GROUP_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setGroupType(t.value as DebtGroup['groupType'])}
              className={`rounded-sm border p-3 text-left transition-all ${
                groupType === t.value
                  ? 'border-accent bg-accent/5'
                  : 'border-border bg-surface-2 hover:border-border-hi'
              }`}
            >
              <p className="font-mono text-[11px] font-medium text-primary">{t.label}</p>
              <p className="font-mono text-[10px] text-muted mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <Input
        label="Tên khoản nợ"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="VD: Vay mẹ mua xe"
        required
      />

      <div>
        <label className="block font-mono text-[10px] uppercase tracking-widest text-muted mb-1.5">
          Tổng số tiền (VND)
        </label>
        <input
          type="number"
          inputMode="decimal"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          placeholder="0"
          required
          className="w-full rounded-sm border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-primary placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />
      </div>

      <Input
        label="Người cho vay / đơn vị"
        value={counterparty}
        onChange={(e) => setCounterparty(e.target.value)}
        placeholder={groupType === 'LOAN_GIVEN' ? 'VD: Nguyễn Văn A' : 'VD: MoMo, Shopee'}
      />

      <Input
        label="Ngày hết hạn"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} type="button" className="flex-1">Hủy</Button>
        <Button type="submit" disabled={isPending || !title || !totalAmount} className="flex-1">
          {isPending ? 'Đang lưu...' : initial?.id ? 'Lưu thay đổi' : 'Tạo nhóm nợ'}
        </Button>
      </div>
    </form>
  )
}

// ── edit modal ────────────────────────────────────────────────────────────────

function EditModal({ group, onClose }: { group: DebtGroup; onClose: () => void }) {
  const update = useUpdateDebtGroup()
  const del    = useDeleteDebtGroup()
  const [showDelete, setShowDelete] = useState(false)

  const handleUpdate = (data: { title: string; groupType: DebtGroup['groupType']; totalAmount: number; dueDate?: string; counterparty?: string }) => {
    update.mutate({ id: group.id, ...data }, {
      onSuccess: () => { toast.success('Đã cập nhật!'); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handleDelete = () => {
    del.mutate(group.id, {
      onSuccess: () => { toast.success('Đã xóa nhóm nợ'); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  return (
    <BottomSheet open onClose={onClose} title="Sửa nhóm nợ">
      <GroupForm
        initial={{
          id: group.id,
          title: group.title,
          groupType: group.groupType,
          totalAmount: Number(group.totalAmount),
          dueDate: group.dueDate,
          counterparty: group.counterparty,
        }}
        onSubmit={handleUpdate}
        onCancel={onClose}
        isPending={update.isPending}
      />
      <div className="border-t border-border pt-3 mt-3">
        {showDelete ? (
          <div className="space-y-2">
            <p className="font-mono text-[11px] text-negative text-center">
              Xóa "{group.title}"? Không thể hoàn tác.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDelete(false)} className="flex-1">Hủy</Button>
              <Button
                onClick={handleDelete}
                disabled={del.isPending}
                className="flex-1 !bg-negative !text-white"
              >
                {del.isPending ? 'Đang xóa...' : 'Xóa'}
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="w-full text-center font-mono text-[11px] text-negative hover:underline py-1"
          >
            Xóa nhóm nợ
          </button>
        )}
      </div>
    </BottomSheet>
  )
}

// ── debt row ──────────────────────────────────────────────────────────────────

function DebtRow({ group, onEdit }: { group: DebtGroup; onEdit: (g: DebtGroup) => void }) {
  const overdue = isOverdue(group.dueDate)
  const remaining = Number(group.totalAmount) - Number(group.paidAmount)

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-t border-border first:border-t-0">
      {/* status glyph */}
      <span
        className="font-mono text-base shrink-0 w-4 text-center"
        style={{ color: overdue ? 'var(--color-negative)' : 'var(--color-faint)' }}
        aria-label={overdue ? 'overdue' : 'normal'}
      >
        ◖
      </span>

      {/* title + meta */}
      <div className="flex-1 min-w-0">
        <button
          onClick={() => onEdit(group)}
          className="text-left block w-full"
        >
          <p className="font-sans text-sm font-medium text-primary truncate hover:text-accent transition-colors">
            {group.title}
          </p>
        </button>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">
            {KIND_MAP[group.groupType] ?? group.groupType}
          </span>
          {group.counterparty && (
            <>
              <span className="text-faint font-mono text-[10px]">·</span>
              <span className="font-mono text-[10px] text-muted truncate">{group.counterparty}</span>
            </>
          )}
        </div>
      </div>

      {/* due date */}
      <div className="shrink-0 text-right hidden sm:block">
        <p className={`font-mono text-[11px] ${overdue ? 'text-negative' : 'text-muted'}`}>
          {relDue(group.dueDate)}
        </p>
        {group.dueDate && (
          <p className="font-mono text-[10px] text-faint">{formatDate(group.dueDate)}</p>
        )}
      </div>

      {/* amount */}
      <div className="shrink-0 text-right">
        <Amount value={remaining} size={13} weight={500} style={{ color: 'var(--color-negative)' }} />
      </div>

      {/* pay pill */}
      <a href={`/debts/${group.id}`}>
        <Pill accent className="shrink-0">Pay</Pill>
      </a>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function DebtGroupsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [editTarget, setEditTarget]     = useState<DebtGroup | null>(null)

  const { data: groups, isLoading, error } = useDebtGroups(statusFilter || undefined)

  const openGroups = groups?.filter((g) => g.status !== 'SETTLED') ?? []
  const totalOwed  = openGroups.reduce((acc, g) => acc + Number(g.totalAmount) - Number(g.paidAmount), 0)

  // Build 28-day timeline markers: groups with dueDate within next 28 days
  const today = Date.now()
  const upcoming = openGroups.filter((g) => {
    if (!g.dueDate) return false
    const diff = new Date(g.dueDate).getTime() - today
    return diff >= 0 && diff <= 28 * 86_400_000
  })

  // Bucket into sections by type order
  const sections = SECTION_ORDER.map((type) => ({
    type,
    label: SECTION_LABEL[type],
    items: openGroups.filter((g) => g.groupType === type),
  })).filter((s) => s.items.length > 0)

  return (
    <div className="space-y-5">
      {/* ── page header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            Money / Debts &amp; credit
          </p>
          <h2 className="font-display italic text-2xl text-primary leading-tight">Debts</h2>
          <p className="font-mono text-[11px] text-muted mt-1">
            {openGroups.length} obligations
            {openGroups.length > 0 && (
              <> · <Amount value={totalOwed} size={11} style={{ color: 'var(--color-negative)' }} /> owed</>
            )}
          </p>
        </div>
        <div className="flex gap-2 shrink-0 mt-1">
          <a href="/debts/new">
            <Pill accent>+ Add debt</Pill>
          </a>
        </div>
      </div>

      {/* ── 28-day timeline marker strip ── */}
      {upcoming.length > 0 && (
        <div className="rounded-sm border border-border bg-surface-2 px-4 py-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-3">
            Upcoming payments · 28 days
          </p>
          <div className="relative h-16">
            {/* axis */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
            {/* markers */}
            {upcoming.map((g) => {
              const diff = new Date(g.dueDate!).getTime() - today
              const pct  = Math.min(100, (diff / (28 * 86_400_000)) * 100)
              const isLate = isOverdue(g.dueDate)
              return (
                <a
                  key={g.id}
                  href={`/debts/${g.id}`}
                  title={g.title}
                  style={{ left: `${pct}%` }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 group"
                >
                  <div
                    className="px-2 py-1 rounded-sm font-mono text-[10px] text-primary whitespace-nowrap"
                    style={{
                      background: 'var(--color-surface-2)',
                      boxShadow: `0 0 0 1px ${isLate ? 'var(--color-negative)' : 'var(--color-border-hi)'}55`,
                    }}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-sm mr-1.5"
                      style={{ background: isLate ? 'var(--color-negative)' : 'var(--color-warning)' }}
                    />
                    {relDue(g.dueDate)}
                  </div>
                </a>
              )
            })}
          </div>
          <div className="flex justify-between font-mono text-[10px] text-faint tracking-[0.06em] mt-1">
            <span>TODAY</span><span>+1 WK</span><span>+2 WK</span><span>+3 WK</span><span>+4 WK</span>
          </div>
        </div>
      )}

      {/* ── filter strip ── */}
      <div className="flex gap-1 bg-surface-2 rounded-sm p-1">
        {[
          { v: '',               l: 'All' },
          { v: 'OPEN,PARTIAL',   l: 'Open' },
          { v: 'SETTLED',        l: 'Settled' },
        ].map(({ v, l }) => (
          <button
            key={v}
            onClick={() => setStatusFilter(v)}
            className={`flex-1 py-1.5 font-mono text-[11px] rounded-sm uppercase tracking-[0.06em] transition-colors ${
              statusFilter === v
                ? 'bg-surface shadow-sm font-medium text-primary'
                : 'text-muted hover:text-primary'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── loading ── */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* ── error ── */}
      {error && (
        <EmptyState icon="⚠️" title="Không tải được" description="Hãy thử lại sau." />
      )}

      {/* ── empty ── */}
      {!isLoading && !error && openGroups.length === 0 && (
        <EmptyState
          icon="◖"
          title="No debts recorded"
          description="Khi bạn ghi nhận khoản vay, nhóm nợ sẽ hiện ở đây."
        />
      )}

      {/* ── grouped sections ── */}
      {!isLoading && !error && sections.map((sec) => (
        <div key={sec.type}>
          <SectionLabel right={`${sec.items.length} items`} className="mb-2">
            {sec.label}
          </SectionLabel>
          <div className="rounded-sm border border-border bg-surface overflow-hidden">
            {sec.items.map((g) => (
              <DebtRow
                key={g.id}
                group={g}
                onEdit={(group) => setEditTarget(group)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* ── edit modal ── */}
      {editTarget && (
        <EditModal
          group={editTarget}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
