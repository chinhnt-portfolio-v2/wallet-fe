import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWallets, useCreateWallet } from '@/hooks/useWallets'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/Button'
import { Amount } from '@/design-system'
import { WalletCard } from '@/components/wallets/wallet-card'
import { WalletForm, type WalletFormData } from '@/components/wallets/wallet-form'
import { WalletEditModal } from '@/components/wallets/wallet-edit-modal'
import { toast } from 'sonner'
import type { Wallet } from '@/types'

// ── Hero card showing total available balance ─────────────────
function WalletHeroCard({ wallets }: { wallets: Wallet[] }) {
  const { t } = useTranslation()
  const active = wallets.filter((w) => w.isActive)
  const totalBalance = active
    .filter((w) => w.type !== 'POSTPAID' && w.type !== 'CREDIT')
    .reduce((s, w) => s + Number(w.balance), 0)
  const totalAssets = active.reduce((s, w) => s + Math.max(0, Number(w.balance)), 0)
  const creditDebt = active.reduce((s, w) => s + Math.abs(Math.min(0, Number(w.balance))), 0)

  return (
    <div className="bg-primary rounded-xl p-5 text-primary-ink shadow-button">
      {/* Main balance */}
      <p className="text-[11px] font-extrabold uppercase tracking-[0.09em] opacity-80">
        {t('wallet.totalAvailableBalance')}
      </p>
      <div className="mt-1.5 flex items-baseline gap-1">
        <Amount value={totalBalance} size={36} weight={800} style={{ color: 'var(--primary-ink)' }} className="tabular-nums tracking-[-0.025em]" />
      </div>
      <p className="text-[12px] opacity-75 font-medium mt-1.5">
        {t('wallet.activeWalletsCount', { count: active.length })}
      </p>

      {/* Inline asset/debt stats — desktop only */}
      <div className="hidden sm:flex gap-3 mt-4">
        <div className="flex-1 rounded-xl bg-white/[0.13] px-4 py-3">
          <p className="text-[11px] font-semibold opacity-80">{t('wallet.totalAssets')}</p>
          <Amount value={totalAssets} size={18} weight={800} style={{ color: 'var(--primary-ink)' }} className="tabular-nums mt-0.5" />
        </div>
        <div className="flex-1 rounded-xl bg-white/[0.13] px-4 py-3">
          <p className="text-[11px] font-semibold opacity-80">{t('wallet.creditDebt')}</p>
          <Amount value={creditDebt} size={18} weight={800} style={{ color: 'var(--primary-ink)' }} className="tabular-nums mt-0.5" />
        </div>
      </div>
    </div>
  )
}

// ── Dashed "add wallet" tile for desktop grid ─────────────────
function AddWalletTile({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <button
      onClick={onClick}
      className="hidden lg:flex flex-col items-center justify-center gap-2 border-[1.5px] border-dashed border-line rounded-xl p-4 text-primary text-sm font-bold hover:bg-hover transition-colors min-h-[140px]"
    >
      <span className="text-2xl" aria-hidden="true">+</span>
      {t('wallet.addNewWallet')}
    </button>
  )
}

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
          <p className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-muted mb-1">
            {t('wallet.subtitle')}
          </p>
          <h1 className="text-xl font-extrabold tracking-[-0.02em] text-ink leading-none">
            {t('wallet.title')}
          </h1>
        </div>
        {/* Action row — visible only when no add-form open */}
        {!showAdd && (
          <div className="flex items-center gap-2">
            {/* Chuyển tiền — soft primary */}
            <Button
              variant="ghost"
              onClick={() => navigate('/wallets/transfer')}
              className="bg-primary-soft text-primary hover:bg-primary-hover text-[13px] font-bold px-4 h-10 rounded-xl"
            >
              {t('wallet.transferAction')}
            </Button>
            {/* Thêm ví — outline */}
            <Button
              variant="outline"
              onClick={() => setShowAdd(true)}
              className="text-[13px] font-bold px-4 h-10 rounded-xl"
            >
              + {t('wallet.addWallet')}
            </Button>
          </div>
        )}
      </div>

      {/* Hero card — shown when wallets loaded */}
      {!isLoading && !error && active.length > 0 && (
        <WalletHeroCard wallets={active} />
      )}

      {/* Add form */}
      {showAdd && (
        <WalletForm
          onSubmit={handleCreate}
          onCancel={() => setShowAdd(false)}
          isPending={createWallet.isPending}
        />
      )}

      {/* Section label */}
      {!isLoading && !error && active.length > 0 && (
        <p className="text-[11px] font-extrabold uppercase tracking-[0.06em] text-muted">
          {t('wallet.accountsLabel')}
        </p>
      )}

      {/* Loading skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-16 lg:h-36 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <EmptyState
          icon="⚠️"
          title={t('wallet.noWalletsLoadError')}
          description={t('wallet.tryAgainLater')}
          action={
            <Button onClick={() => window.location.reload()}>{t('common.retry')}</Button>
          }
        />
      )}

      {/* Wallet list — mobile rows / desktop 3-col grid */}
      {!isLoading && !error && active.length > 0 && (
        <>
          {/* Mobile: vertical list */}
          <div className="lg:hidden space-y-2">
            {active.map((w) => (
              <WalletCard key={w.id} wallet={w} onEdit={setEditTarget} />
            ))}
          </div>

          {/* Desktop: 3-col grid + dashed add tile */}
          <div className="hidden lg:grid grid-cols-3 gap-4">
            {active.map((w) => (
              <WalletCard key={w.id} wallet={w} onEdit={setEditTarget} />
            ))}
            <AddWalletTile onClick={() => setShowAdd(true)} />
          </div>
        </>
      )}

      {/* Empty */}
      {!isLoading && !error && active.length === 0 && (
        <EmptyState
          icon="💼"
          title={t('wallet.noWallets')}
          description={t('wallet.noWalletsDesc')}
          action={
            <Button onClick={() => setShowAdd(true)}>
              + {t('wallet.createWalletShort')}
            </Button>
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
