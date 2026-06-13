import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import type { Wallet, WalletType } from '@/types'

const WALLET_COLORS = [
  '#0EA5E9', '#10B981', '#F97316', '#8B5CF6',
  '#EC4899', '#F59E0B', '#06B6D4', '#64748B',
]

// Wallet types selectable in the create/edit form.
const FORM_WALLET_TYPES: WalletType[] = ['CASH', 'BANK', 'E_WALLET', 'POSTPAID']

export interface WalletFormData {
  name: string
  icon: string
  color: string
  type: Wallet['type']
  initialBalance?: number
}

export function WalletForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: { id?: number; name: string; icon: string; color: string; type: Wallet['type']; balance?: number }
  onSubmit: (data: WalletFormData) => void
  onCancel: () => void
  isPending: boolean
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(initial?.name ?? '')
  const [type, setType] = useState<Wallet['type']>(initial?.type ?? 'CASH')
  const [color, setColor] = useState(initial?.color ?? '#0EA5E9')
  const [initialBalance, setInitialBalance] = useState(initial?.balance?.toString() ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { toast.error(t('wallet.enterName')); return }
    const balance = initialBalance ? parseFloat(initialBalance) : undefined
    // Icon kept as the wallet's first letter — editorial letter tiles, no emoji.
    onSubmit({ name: name.trim(), icon: (name.trim()[0] ?? '?').toUpperCase(), color, type, initialBalance: balance })
  }

  const letter = (name.trim()[0] ?? '?').toUpperCase()

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-surface border border-border rounded-lg">
      <p className="font-mono text-[11px] uppercase tracking-widest text-secondary">
        {initial?.id ? t('wallet.editWallet') : t('wallet.createWallet')}
      </p>

      <Input
        label={t('wallet.name')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('wallet.namePlaceholder')}
        required
      />

      <Select
        label={t('wallet.typeLabel')}
        value={type}
        onChange={(e) => setType(e.target.value as Wallet['type'])}
        options={FORM_WALLET_TYPES.map((wt) => ({ value: wt, label: t(`wallet.types.${wt}`) }))}
      />

      <div>
        <label className="block font-mono text-[11px] uppercase tracking-widest text-secondary mb-2">{t('wallet.color')}</label>
        <div className="flex gap-2 flex-wrap">
          {WALLET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={c}
              className={`w-7 h-7 rounded-full transition-all ${
                color === c ? 'ring-2 ring-offset-2 ring-border-hi scale-110' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {!initial?.id && (
        <div>
          <Input
            label={t('wallet.initialBalance')}
            type="number"
            inputMode="decimal"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            placeholder="0"
            min="0"
            className="font-mono"
            hint={t('wallet.initialBalanceHint')}
          />
        </div>
      )}

      {/* Preview — letter tile */}
      <div className="flex items-center gap-3 p-3 rounded border border-border-hi bg-surface-2">
        <div
          className="w-10 h-10 rounded flex items-center justify-center font-mono text-base font-semibold shrink-0"
          style={{ backgroundColor: `${color}22`, color }}
        >
          {letter}
        </div>
        <div>
          <p className="font-sans text-[13px] font-medium text-primary">{name || t('common.preview')}</p>
          <p className="font-mono text-[11px] text-secondary uppercase tracking-wide">{t(`wallet.types.${type}`)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} type="button" className="flex-1">{t('common.cancel')}</Button>
        <Button type="submit" disabled={isPending || !name.trim()} className="flex-1">
          {isPending ? t('common.saving') : initial?.id ? t('common.saveChanges') : t('wallet.createWalletShort')}
        </Button>
      </div>
    </form>
  )
}
