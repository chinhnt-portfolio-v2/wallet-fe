import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useCategories, useCreateCategory } from '@/hooks/useCategories'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { SectionLabel } from '@/design-system'
import { CategoryForm, type CategoryFormData } from '@/components/categories/category-form'
import { CategoryEditModal } from '@/components/categories/category-edit-modal'
import { toast } from 'sonner'

type EditTarget = { id: number } & CategoryFormData

export default function CategoriesPage() {
  const { t } = useTranslation()
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const [showForm, setShowForm] = useState(false)
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null)
  const [tab, setTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE')

  const visible = Array.isArray(categories) ? categories.filter((c) => c.type === tab) : []

  const handleCreate = (data: CategoryFormData) => {
    createCategory.mutate(data, {
      onSuccess: () => { toast.success(t('category.created')); setShowForm(false) },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  return (
    <div className="page-enter space-y-5">
      {/* Header — one page-title recipe (serif italic + mono eyebrow) */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-secondary mb-0.5">{t('category.subtitle')}</p>
          <h2 className="font-display italic text-2xl text-primary leading-tight">{t('category.title')}</h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`h-7 px-3 rounded-full font-mono text-[11px] uppercase tracking-[0.05em] transition-all ${
            showForm
              ? 'bg-transparent shadow-[inset_0_0_0_1px_var(--color-border-hi)] text-primary hover:bg-surface-2'
              : 'bg-accent text-accent-ink hover:brightness-105 cta-glow'
          }`}
        >
          {showForm ? `− ${t('category.close')}` : `+ ${t('category.add')}`}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <CategoryForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isPending={createCategory.isPending}
        />
      )}

      {/* Tab — one segmented style (lime), never coral */}
      <SegmentedControl
        options={[
          { value: 'EXPENSE', label: t('category.expense') },
          { value: 'INCOME',  label: t('category.income') },
        ]}
        value={tab}
        onChange={(v) => setTab(v as 'INCOME' | 'EXPENSE')}
        ariaLabel={t('category.title')}
        className="w-full grid grid-cols-2"
      />

      {/* Section label with count */}
      {!isLoading && (
        <SectionLabel right={t('category.countLabel', { count: visible.length })}>
          {tab === 'EXPENSE' ? t('category.expense') : t('category.income')}
        </SectionLabel>
      )}

      {/* Loading — mirrors the row list layout */}
      {isLoading && (
        <div className="bg-surface border border-border rounded-lg divide-y divide-border">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="w-8 h-8 rounded-md shrink-0" />
              <Skeleton className="h-3.5 w-32" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && visible.length === 0 && (
        <EmptyState
          icon="🏷️"
          title={t('category.noCategories')}
          description={t('category.noCategoriesDesc', { type: tab === 'EXPENSE' ? t('category.expense') : t('category.income') })}
        />
      )}

      {/* List — emoji rendered at 16px inside a neutral colour-tinted tile */}
      {!isLoading && visible.length > 0 && (
        <div className="bg-surface border border-border rounded-lg divide-y divide-border">
          {visible.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setEditTarget(cat as EditTarget)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-2 transition-colors text-left"
            >
              <span
                className="w-8 h-8 rounded-md flex items-center justify-center text-base shrink-0"
                style={{ backgroundColor: `${cat.color ?? '#64748B'}1f` }}
                aria-hidden="true"
              >
                {cat.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-primary truncate">{cat.name}</p>
              </div>
              {cat.isDefault && (
                <Badge variant="neutral" className="text-2xs px-1.5 py-0 shrink-0">{t('category.default')}</Badge>
              )}
              <span className="font-mono text-[11px] text-secondary shrink-0" aria-hidden="true">→</span>
            </button>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <CategoryEditModal category={editTarget} onClose={() => setEditTarget(null)} />
      )}
    </div>
  )
}
