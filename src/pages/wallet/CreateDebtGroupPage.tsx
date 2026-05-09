import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useWallets } from '@/hooks/useWallets'
import { useCreateDebtGroup } from '@/hooks/useDebtGroups'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils'
import type { CreateDebtGroupRequest } from '@/types'

const GROUP_TYPES = [
  { value: 'BNPL', label: 'Mua trả sau (BNPL)', icon: '🛒', desc: 'Mua hàng trả sau, ví trả sau' },
  { value: 'DEBT', label: 'Vay nợ cá nhân', icon: '🤝', desc: 'Vay tiền người thân, bạn bè' },
  { value: 'LOAN_GIVEN', label: 'Cho vay', icon: '💸', desc: 'Cho người khác vay tiền' },
  { value: 'PURCHASE_CREDIT', label: 'Mua chịu', icon: '📦', desc: 'Mua hàng chưa trả tiền' },
]

export default function CreateDebtGroupPage() {
  const navigate = useNavigate()
  const { data: wallets } = useWallets()
  const createDebtGroup = useCreateDebtGroup()

  const [title, setTitle] = useState('')
  const [groupType, setGroupType] = useState<CreateDebtGroupRequest['groupType']>('DEBT')
  const [totalAmount, setTotalAmount] = useState('')
  const [walletId, setWalletId] = useState<number | undefined>()
  const [counterparty, setCounterparty] = useState('')
  const [dueDate, setDueDate] = useState('')

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

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">Tạo nhóm nợ</h2>
          <p className="text-xs text-muted">Ghi nhận khoản vay / mua trả sau</p>
        </div>
        <button onClick={() => navigate(-1)} className="btn-ghost text-sm px-2">←</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Group type */}
        <div>
          <label className="block text-xs font-medium text-secondary mb-2">Loại nhóm</label>
          <div className="grid grid-cols-2 gap-2">
            {GROUP_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setGroupType(t.value as CreateDebtGroupRequest['groupType'])}
                className={`card p-3 text-left transition-all ${
                  groupType === t.value
                    ? 'border-accent ring-2 ring-accent/20'
                    : 'hover:border-accent/50'
                }`}
              >
                <p className="text-lg mb-1">{t.icon}</p>
                <p className="text-xs font-medium text-primary">{t.label}</p>
                <p className="text-xs text-muted mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <Input
          label="Tên khoản nợ"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={
            groupType === 'BNPL' ? 'VD: Mua laptop MSI trả góp' :
            groupType === 'LOAN_GIVEN' ? 'VD: Cho Nam vay tiền' :
            'VD: Vay mẹ tiền mua xe'
          }
          required
        />

        {/* Amount */}
        <Input
          label="Tổng số tiền (VND)"
          type="number"
          inputMode="decimal"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          placeholder="0"
          required
        />
        {totalAmount && (
          <p className="text-xs text-muted -mt-2">
            = {formatCurrency(parseFloat(totalAmount) || 0)}
          </p>
        )}

        {/* Wallet (optional) */}
        <div>
          <label className="block text-xs font-medium text-secondary mb-2">
            Ví thanh toán (tùy chọn)
          </label>
          <select
            value={walletId ?? ''}
            onChange={(e) => setWalletId(e.target.value ? Number(e.target.value) : undefined)}
            className="input"
          >
            <option value="">— Không chọn —</option>
            {wallets?.map((w) => (
              <option key={w.id} value={w.id}>{w.icon} {w.name}</option>
            ))}
          </select>
          <p className="text-xs text-muted mt-1">
            Chọn ví nếu bạn dùng ví này để thanh toán khoản nợ
          </p>
        </div>

        {/* Counterparty */}
        <Input
          label={
            groupType === 'LOAN_GIVEN'
              ? 'Người vay tiền'
              : 'Người cho vay / đơn vị'
          }
          value={counterparty}
          onChange={(e) => setCounterparty(e.target.value)}
          placeholder={
            groupType === 'LOAN_GIVEN' ? 'VD: Nguyễn Văn A' : 'VD: MoMo, Shopee'
          }
        />

        {/* Due date */}
        <Input
          label="Ngày hết hạn (tùy chọn)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        {/* Submit */}
        <Button
          type="submit"
          disabled={createDebtGroup.isPending || !title || !totalAmount}
          className="w-full py-3"
        >
          {createDebtGroup.isPending ? 'Đang tạo...' : '✓ Tạo nhóm nợ'}
        </Button>
      </form>
    </div>
  )
}
