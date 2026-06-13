import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWallets, useCreateWallet } from '@/hooks/useWallets'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pill } from '@/design-system'
import { WalletCard } from '@/components/wallets/wallet-card'
import { WalletForm, type WalletFormData } from '@/components/wallets/wallet-form'
import { WalletEditModal } from '@/components/wallets/wallet-edit-modal'
import { toast } from 'sonner'
import type { Wallet } from '@/types'

export default function WalletsPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState<Wallet | null>(null)

  const { data: wallets, isLoading, error } = useWallets()
  const createWallet = useCreateWallet()

  const handleCreate = (data: WalletFormData) => {
    createWallet.mutate(data, {
      onSuccess: () => {
        toast.success(t('wallet.created'))
        setShowAdd(false)
      },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const active = Array.isArray(wallets) ? wallets : []

  return (
    <div className="page-enter space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-1">
            {t('wallet.subtitle')}
          </p>
          <h2 className="font-display italic text-[28px] leading-none text-primary">{t('wallet.title')}</h2>
          <p className="font-mono text-[11px] text-secondary mt-1">
            {t('wallet.accountsCount', { count: active.length })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Pill ghost onClick={() => navigate('/wallets/transfer')}>↔ {t('nav.transfer')}</Pill>
          <Pill accent className="cta-glow" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? `− ${t('common.close')}` : `+ ${t('wallet.newWallet')}`}
          </Pill>
        </div>
      </div>

      {/* Add form */}
      {showAdd && (
        <WalletForm
          onSubmit={handleCreate}
          onCancel={() => setShowAdd(false)}
          isPending={createWallet.isPending}
        />
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-24 w-full rounded-lg" />)}
        </div>
      )}

      {/* Error */}
      {error && (
        <EmptyState
          icon="⚠️"
          title={t('wallet.noWalletsLoadError')}
          description={t('wallet.tryAgainLater')}
          action={<Pill accent onClick={() => window.location.reload()}>{t('common.retry')}</Pill>}
        />
      )}

      {/* Flat wallet grid — no type-group headers (audit §2.6) */}
      {!isLoading && !error && active.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {active.map((w) => (
            <WalletCard key={w.id} wallet={w} onEdit={setEditTarget} />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && active.length === 0 && (
        <EmptyState
          icon="💼"
          title={t('wallet.noWallets')}
          description={t('wallet.noWalletsDesc')}
          action={
            <Pill accent onClick={() => setShowAdd(true)}>
              + {t('wallet.createWalletShort')}
            </Pill>
          }
        />
      )}

      {/* Edit modal */}
      {editTarget && (
        <WalletEditModal wallet={editTarget} onClose={() => setEditTarget(null)} />
      )}
    </div>
  )
}
