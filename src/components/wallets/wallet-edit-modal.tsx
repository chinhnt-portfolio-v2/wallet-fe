import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useUpdateWallet, useDeleteWallet } from '@/hooks/useWallets'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { WalletForm, type WalletFormData } from './wallet-form'
import { formatCurrency } from '@/lib/utils'
import type { Wallet } from '@/types'

export function WalletEditModal({ wallet, onClose }: { wallet: Wallet; onClose: () => void }) {
  const { t } = useTranslation()
  const update = useUpdateWallet()
  const del = useDeleteWallet()
  const [showDelete, setShowDelete] = useState(false)

  const handleUpdate = (data: WalletFormData) => {
    update.mutate({ id: wallet.id, ...data, initialBalance: Number(wallet.balance) }, {
      onSuccess: () => { toast.success(t('wallet.updated')); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handleDelete = () => {
    del.mutate(wallet.id, {
      onSuccess: () => { toast.success(t('wallet.deleted')); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  return (
    <BottomSheet open onClose={onClose} title={t('wallet.editWallet')}>
      <WalletForm initial={wallet} onSubmit={handleUpdate} onCancel={onClose} isPending={update.isPending} />
      <div className="border-t border-border pt-3 mt-3">
        {showDelete ? (
          <div className="space-y-3">
            <div className="p-3 rounded border border-negative/20 bg-negative/5 space-y-1">
              <p className="font-mono text-[11px] uppercase tracking-widest text-negative">
                {t('wallet.deleteWarning')}
              </p>
              <p className="font-mono text-[11px] text-secondary">
                {t('wallet.deleteDetail', { name: wallet.name, balance: formatCurrency(Number(wallet.balance)) })}
              </p>
            </div>
            <p className="font-mono text-[11px] text-negative text-center uppercase tracking-widest">
              {t('common.cannotUndo')}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDelete(false)} className="flex-1">{t('common.cancel')}</Button>
              <Button onClick={handleDelete} disabled={del.isPending} className="flex-1 !bg-negative !text-white">
                {del.isPending ? t('common.deleting') : t('common.delete')}
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="w-full text-center font-mono text-[11px] uppercase tracking-widest text-negative hover:underline py-1"
          >
            {t('common.delete')}
          </button>
        )}
      </div>
    </BottomSheet>
  )
}
