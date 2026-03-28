import { useState } from 'react'
import { useWallets, useCreateWallet } from '@/hooks/useWallets'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency, WALLET_TYPE_LABEL } from '@/lib/utils'
import { WALLET_ICONS, WALLET_COLORS } from '@/stores/walletStore'
import type { CreateWalletRequest } from '@/types'

export default function WalletsPage() {
  const [isAdding, setIsAdding] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<CreateWalletRequest['type']>('CASH')
  const [icon, setIcon] = useState('💰')
  const [color, setColor] = useState('#0EA5E9')

  const { data: wallets, isLoading, error } = useWallets()
  const createWallet = useCreateWallet()

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    createWallet.mutate(
      { name, type, icon, color },
      {
        onSuccess: () => {
          setIsAdding(false)
          setName('')
          setType('CASH')
          setIcon('💰')
          setColor('#0EA5E9')
        },
        onError: (err: Error) => alert(err.message),
      }
    )
  }

  const active = Array.isArray(wallets) ? wallets : []
  const byType = {
    CASH: active.filter((w) => w.type === 'CASH'),
    BANK: active.filter((w) => w.type === 'BANK'),
    E_WALLET: active.filter((w) => w.type === 'E_WALLET'),
    POSTPAID: active.filter((w) => w.type === 'POSTPAID'),
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-primary">Ví của tôi</h2>
          <p className="text-xs text-muted">{active.length} ví</p>
        </div>
        <Button
          variant={isAdding ? 'outline' : 'accent'}
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? '− Đóng' : '+ Thêm ví'}
        </Button>
      </div>

      {/* Add wallet form */}
      {isAdding && (
        <Card className="space-y-4">
          <p className="text-sm font-semibold text-primary">Tạo ví mới</p>

          <Input
            label="Tên ví"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="VD: Ví MoMo, Timo..."
            required
          />

          <div>
            <label className="block text-xs font-medium text-secondary mb-2">Loại</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as CreateWalletRequest['type'])}
              className="w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              {Object.entries(WALLET_TYPE_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-2">Icon</label>
            <div className="flex gap-2 flex-wrap">
              {WALLET_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-9 h-9 text-lg rounded-md border transition-all ${
                    icon === i ? 'border-accent ring-2 ring-accent/30' : 'border-border hover:border-accent/50'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-secondary mb-2">Màu</label>
            <div className="flex gap-2">
              {WALLET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all ${
                    color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsAdding(false)} className="flex-1">
              Hủy
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createWallet.isPending || !name}
              className="flex-1"
            >
              {createWallet.isPending ? 'Đang tạo...' : 'Tạo ví'}
            </Button>
          </div>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-md" />)}
        </div>
      )}

      {/* Error */}
      {error && (
        <EmptyState icon="⚠️" title="Không tải được ví" description="Hãy thử lại sau." />
      )}

      {/* Wallet list by type */}
      {!isLoading && !error && (
        <div className="space-y-6">
          {(['CASH', 'BANK', 'E_WALLET', 'POSTPAID'] as const).map((t) => {
            const items = byType[t]
            if (!items?.length) return null
            return (
              <div key={t}>
                <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
                  {WALLET_TYPE_LABEL[t]}
                </p>
                <div className="space-y-2">
                  {items.map((w) => (
                    <div key={w.id} className="card p-4 flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-xl shrink-0"
                        style={{ backgroundColor: `${w.color}20` }}
                      >
                        {w.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-primary">{w.name}</p>
                        <p className="text-2xs text-muted">{WALLET_TYPE_LABEL[w.type]}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold font-mono tabular-nums ${
                          Number(w.balance) < 0 ? 'text-negative' : 'text-primary'
                        }`}>
                          {formatCurrency(Number(w.balance))}
                        </p>
                        <p className="text-2xs text-muted">₫</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
