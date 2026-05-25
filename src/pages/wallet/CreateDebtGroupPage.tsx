import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useWallets } from '@/hooks/useWallets'
import { useCreateDebtGroup } from '@/hooks/useDebtGroups'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Amount, SectionLabel, Pill } from '@/design-system'
import type { CreateDebtGroupRequest } from '@/types'

const GROUP_TYPES: {
  value: CreateDebtGroupRequest['groupType']
  label: string
  desc: string
  glyph: string
}[] = [
  { value: 'PURCHASE_CREDIT', label: 'Credit',        desc: 'Mua chịu / thẻ tín dụng', glyph: '◆' },
  { value: 'BNPL',            label: 'BNPL',           desc: 'Mua trả sau',              glyph: '◈' },
  { value: 'DEBT',            label: 'Friend / Family', desc: 'Vay người thân, bạn bè',  glyph: '◇' },
  { value: 'LOAN_GIVEN',      label: 'Loan given',     desc: 'Cho người khác vay',       glyph: '◉' },
]

export default function CreateDebtGroupPage() {
  const navigate = useNavigate()
  const { data: wallets } = useWallets()
  const createDebtGroup = useCreateDebtGroup()

  const [title, setTitle]           = useState('')
  const [groupType, setGroupType]   = useState<CreateDebtGroupRequest['groupType']>('DEBT')
  const [totalAmount, setTotalAmount] = useState('')
  const [walletId, setWalletId]     = useState<number | undefined>()
  const [counterparty, setCounterparty] = useState('')
  const [dueDate, setDueDate]       = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !totalAmount) {
      toast.error('Nhập đầy đủ thông tin')
      return
    }
    if (parseFloat(totalAmount) <= 0) {
      toast.error('Số tiền phải lớn hơn 0')
      return
    }

    const payload: CreateDebtGroupRequest = {
      title,
      groupType,
      totalAmount: parseFloat(totalAmount),
      walletId,
      counterparty: counterparty || undefined,
      dueDate: dueDate || undefined,
    }

    createDebtGroup.mutate(payload, {
      onSuccess: () => {
        toast.success('Đã tạo nhóm nợ!')
        navigate('/debts')
      },
      onError: (err: Error) => {
        toast.error(err.message ?? 'Có lỗi xảy ra. Vui lòng thử lại.')
      },
    })
  }

  const selectedType = GROUP_TYPES.find((t) => t.value === groupType)

  return (
    <div className="space-y-5">
      {/* ── page header ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-1">
            Money / Debts &amp; credit
          </p>
          <h2 className="font-display italic text-2xl text-primary leading-tight">New debt</h2>
          <p className="font-mono text-[11px] text-muted mt-1">
            Ghi nhận khoản vay / mua trả sau
          </p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-1 font-mono text-[11px] text-muted hover:text-primary transition-colors uppercase tracking-[0.08em] shrink-0"
        >
          ← Back
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── type selector ── */}
        <div>
          <SectionLabel className="mb-3">Loại nhóm</SectionLabel>
          <div className="grid grid-cols-2 gap-2">
            {GROUP_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setGroupType(t.value)}
                className={`rounded-sm border p-3 text-left transition-all ${
                  groupType === t.value
                    ? 'border-accent bg-accent/5'
                    : 'border-border bg-surface-2 hover:border-border-hi'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="font-mono text-base"
                    style={{
                      color: groupType === t.value
                        ? 'var(--color-accent)'
                        : 'var(--color-muted)',
                    }}
                  >
                    {t.glyph}
                  </span>
                  <span className="font-mono text-[11px] font-medium text-primary">{t.label}</span>
                </div>
                <p className="font-mono text-[10px] text-muted">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* ── core fields ── */}
        <div className="rounded-sm border border-border bg-surface px-4 py-4 space-y-4">
          <SectionLabel className="mb-1">Details</SectionLabel>

          {/* title */}
          <Input
            label="Tên khoản nợ"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              groupType === 'BNPL'       ? 'VD: Mua laptop MSI trả góp' :
              groupType === 'LOAN_GIVEN' ? 'VD: Cho Nam vay tiền' :
                                           'VD: Vay mẹ tiền mua xe'
            }
            required
          />

          {/* amount */}
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
            {totalAmount && parseFloat(totalAmount) > 0 && (
              <p className="font-mono text-[10px] text-muted mt-1.5 flex items-center gap-1">
                <span className="text-faint">=</span>
                <Amount value={parseFloat(totalAmount)} size={10} />
              </p>
            )}
          </div>

          {/* counterparty */}
          <Input
            label={groupType === 'LOAN_GIVEN' ? 'Người vay tiền' : 'Người cho vay / đơn vị'}
            value={counterparty}
            onChange={(e) => setCounterparty(e.target.value)}
            placeholder={groupType === 'LOAN_GIVEN' ? 'VD: Nguyễn Văn A' : 'VD: MoMo, Shopee'}
          />

          {/* due date */}
          <Input
            label="Ngày hết hạn (tùy chọn)"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* ── wallet (optional) ── */}
        <div className="rounded-sm border border-border bg-surface px-4 py-4 space-y-3">
          <SectionLabel className="mb-1">Ví thanh toán</SectionLabel>
          <select
            value={walletId ?? ''}
            onChange={(e) => setWalletId(e.target.value ? Number(e.target.value) : undefined)}
            className="w-full rounded-sm border border-border bg-surface-2 px-3 py-2 font-mono text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          >
            <option value="">— Không chọn —</option>
            {wallets?.map((w) => (
              <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
            ))}
          </select>
          <p className="font-mono text-[10px] text-faint">
            Chọn ví nếu bạn dùng ví này để thanh toán khoản nợ
          </p>
        </div>

        {/* ── summary strip ── */}
        {title && totalAmount && parseFloat(totalAmount) > 0 && (
          <div className="rounded-sm border border-border-hi bg-surface-2 px-4 py-3 flex items-center justify-between gap-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-0.5">
                Creating
              </p>
              <p className="font-sans text-sm font-medium text-primary truncate max-w-[160px]">
                {title}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted mb-0.5">
                {selectedType?.label}
              </p>
              <Amount value={parseFloat(totalAmount)} size={16} weight={500} style={{ color: 'var(--color-negative)' }} />
            </div>
          </div>
        )}

        {/* ── submit ── */}
        <Pill
          accent
          type="submit"
          disabled={createDebtGroup.isPending || !title || !totalAmount}
          className="w-full !h-10 !rounded-sm !text-[12px] justify-center disabled:opacity-40"
        >
          {createDebtGroup.isPending ? 'Đang tạo...' : `Create ${selectedType?.label ?? 'debt'}`}
        </Pill>
      </form>
    </div>
  )
}
