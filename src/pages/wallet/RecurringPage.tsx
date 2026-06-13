import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useRecurringRules, useCreateRecurring, useUpdateRecurring, useToggleRecurring, useDeleteRecurring } from '@/hooks/useRecurring'
import { useWallets } from '@/hooks/useWallets'
import { useCategories } from '@/hooks/useCategories'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { SectionLabel, Pill } from '@/design-system'
import { RecurringCard } from '@/components/recurring/recurring-card'
import { RecurringForm, type RecurringFormData } from '@/components/recurring/recurring-form'
import type { RecurringRule, CreateRecurringRequest } from '@/types'

export default function RecurringPage() {
  const { t } = useTranslation()
  const { data: rules, isLoading } = useRecurringRules()
  const { data: wallets } = useWallets()
  const { data: categories } = useCategories()
  const toggle = useToggleRecurring()
  const deleteR = useDeleteRecurring()
  const createRecurring = useCreateRecurring()
  const updateRecurring = useUpdateRecurring()

  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<RecurringRule | null>(null)

  const handleToggle = (rule: RecurringRule) => {
    const newStatus = rule.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE'
    toggle.mutate({ id: rule.id, status: newStatus }, {
      onSuccess: () => toast.success(newStatus === 'ACTIVE' ? t('recurring.activated') : t('recurring.pausedToast')),
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handleDelete = (rule: RecurringRule) => {
    if (!confirm(t('recurring.deleteConfirm', { name: rule.category?.name ?? '' }))) return
    deleteR.mutate(rule.id, {
      onSuccess: () => toast.success(t('recurring.deleted')),
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handleSubmit = (data: RecurringFormData) => {
    if (editTarget) {
      const updatePayload: CreateRecurringRequest & { id: number } = { id: editTarget.id, ...data }
      updateRecurring.mutate(updatePayload, {
        onSuccess: () => { toast.success(t('recurring.updated')); setShowForm(false); setEditTarget(null) },
        onError: (e: Error) => toast.error(e.message),
      })
    } else {
      const createPayload: CreateRecurringRequest = data
      createRecurring.mutate(createPayload, {
        onSuccess: () => { toast.success(t('recurring.created')); setShowForm(false) },
        onError: (e: Error) => toast.error(e.message),
      })
    }
  }

  const activeRules = rules?.filter((r) => r.status === 'ACTIVE') ?? []
  const pausedRules = rules?.filter((r) => r.status !== 'ACTIVE') ?? []

  const openCreate = () => { setEditTarget(null); setShowForm(true) }

  return (
    <div className="page-enter space-y-5">
      {/* Header — one page-title recipe (serif italic + mono eyebrow) */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-0.5">{t('recurring.subtitle')}</p>
          <h2 className="font-display italic text-2xl text-primary leading-tight">{t('recurring.title')}</h2>
        </div>
        <button
          onClick={openCreate}
          className="h-7 px-3 rounded-full font-mono text-[11px] uppercase tracking-[0.05em] bg-accent text-accent-ink hover:brightness-105 cta-glow transition-all"
        >
          + {t('recurring.createNew')}
        </button>
      </div>

      {/* Loading — shimmer skeletons */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
              <Skeleton className="h-5 w-24" />
            </div>
          ))}
        </div>
      )}

      {/* Empty — real EmptyState with examples + CTA */}
      {!isLoading && rules?.length === 0 && (
        <EmptyState
          icon="🔁"
          title={t('recurring.noRecurring')}
          description={t('recurring.noRecurringDesc')}
          examples={[t('recurring.exampleSalary'), t('recurring.exampleRent'), t('recurring.exampleSubscription')]}
          action={
            <Pill accent className="cta-glow" onClick={openCreate}>
              + {t('recurring.createFirst')}
            </Pill>
          }
        />
      )}

      {/* Active rules */}
      {!isLoading && activeRules.length > 0 && (
        <div className="space-y-3">
          <SectionLabel right={t('recurring.rulesCount', { count: activeRules.length })}>{t('recurring.active')}</SectionLabel>
          {activeRules.map((r) => (
            <RecurringCard
              key={r.id}
              rule={r}
              onEdit={() => { setEditTarget(r); setShowForm(true) }}
              onDelete={() => handleDelete(r)}
              onToggle={() => handleToggle(r)}
            />
          ))}
        </div>
      )}

      {/* Paused rules */}
      {!isLoading && pausedRules.length > 0 && (
        <div className="space-y-3">
          <SectionLabel right={t('recurring.rulesCount', { count: pausedRules.length })}>{t('recurring.paused')}</SectionLabel>
          {pausedRules.map((r) => (
            <RecurringCard
              key={r.id}
              rule={r}
              onEdit={() => { setEditTarget(r); setShowForm(true) }}
              onDelete={() => handleDelete(r)}
              onToggle={() => handleToggle(r)}
            />
          ))}
        </div>
      )}

      {/* Form BottomSheet */}
      <BottomSheet
        open={showForm}
        onClose={() => { setShowForm(false); setEditTarget(null) }}
        title={editTarget ? t('recurring.editRecurring') : t('recurring.createRecurring')}
      >
        <RecurringForm
          editRule={editTarget ?? undefined}
          wallets={wallets ?? []}
          categories={categories ?? []}
          onClose={() => { setShowForm(false); setEditTarget(null) }}
          onSubmit={handleSubmit}
        />
      </BottomSheet>
    </div>
  )
}
