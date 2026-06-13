import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { useCategories, useCreateCategory } from '@/hooks/useCategories'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { SectionLabel, Pill } from '@/design-system'
import { CategoryForm, type CategoryFormData } from '@/components/categories/category-form'
import { CategoryEditModal } from '@/components/categories/category-edit-modal'
import { toast } from 'sonner'
import type { Category } from '@/types'

type EditTarget = { id: number } & CategoryFormData

// ── Category card in the grid ─────────────────────────────────────────────
function CategoryCard({
  cat,
  onClick,
}: {
  cat: Category
  onClick: () => void
}) {
  const { t } = useTranslation()
  const color = cat.color ?? '#64748B'
  const chipBg = `${color}1f`   // ~12% alpha — Minh spec category chip

  return (
    <button
      onClick={onClick}
      className="group bg-surface border border-line rounded-md p-3 text-left hover:shadow-pop hover:border-primary/30 transition-all"
    >
      {/* Icon chip */}
      <div
        className="w-10 h-10 rounded-sm flex items-center justify-center text-xl mb-2.5 shrink-0"
        style={{ backgroundColor: chipBg, color }}
        aria-hidden="true"
      >
        {cat.icon}
      </div>

      {/* Name */}
      <p className="text-sm font-bold text-ink truncate leading-tight mb-1">
        {cat.name}
      </p>

      {/* Tags row */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <span
          className={`text-[10px] font-extrabold uppercase tracking-[0.07em] px-1.5 py-0.5 rounded-sm ${
            cat.isDefault
              ? 'bg-surface-2 text-muted'
              : 'bg-primary-soft text-primary'
          }`}
        >
          {cat.isDefault ? t('category.default') : t('category.custom')}
        </span>
        {/* Desktop: txn count placeholder — API doesn't expose it yet */}
        <span className="hidden md:block text-[10px] font-semibold text-muted">
          {/* txn count would go here when API supports it */}
        </span>
      </div>
    </button>
  )
}

// ── Dashed "add" tile ─────────────────────────────────────────────────────
function AddCategoryTile({ onClick }: { onClick: () => void }) {
  const { t } = useTranslation()
  return (
    <button
      onClick={onClick}
      className="group bg-surface border-2 border-dashed border-line rounded-md p-3 flex flex-col items-center justify-center gap-2 min-h-[96px] hover:border-primary/50 hover:bg-primary-soft/30 transition-all"
    >
      <span className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-ink transition-colors">
        <Plus size={16} strokeWidth={2.5} />
      </span>
      <span className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted group-hover:text-primary transition-colors">
        {t('category.add')}
      </span>
    </button>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const { t } = useTranslation()
  const { data: categories, isLoading } = useCategories()
  const createCategory = useCreateCategory()
  const [showForm,    setShowForm]    = useState(false)
  const [editTarget,  setEditTarget]  = useState<EditTarget | null>(null)
  const [tab,         setTab]         = useState<'EXPENSE' | 'INCOME'>('EXPENSE')

  const visible = Array.isArray(categories)
    ? categories.filter((c) => c.type === tab)
    : []

  const handleCreate = (data: CategoryFormData) => {
    createCategory.mutate(data, {
      onSuccess: () => { toast.success(t('category.created')); setShowForm(false) },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  return (
    <div className="page-enter space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.07em] text-muted mb-0.5">
            {t('category.subtitle')}
          </p>
          <h1 className="text-xl font-extrabold tracking-[-0.02em] text-ink leading-tight">
            {t('category.title')}
          </h1>
        </div>
        <Pill
          accent={!showForm}
          ghost={showForm}
          onClick={() => setShowForm(!showForm)}
          className="min-h-[44px]"
        >
          {showForm ? `− ${t('category.close')}` : `+ ${t('category.add')}`}
        </Pill>
      </div>

      {/* Inline create form */}
      {showForm && (
        <CategoryForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          isPending={createCategory.isPending}
        />
      )}

      {/* Tabs */}
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

      {/* Section label */}
      {!isLoading && (
        <SectionLabel right={t('category.countLabel', { count: visible.length })}>
          {tab === 'EXPENSE' ? t('category.expense') : t('category.income')}
        </SectionLabel>
      )}

      {/* Loading skeletons — grid shape */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-surface border border-line rounded-md p-3 space-y-2">
              <Skeleton className="w-10 h-10 rounded-sm" />
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && visible.length === 0 && !showForm && (
        <EmptyState
          icon="🏷️"
          title={t('category.noCategories')}
          description={t('category.noCategoriesDesc', {
            type: tab === 'EXPENSE' ? t('category.expense') : t('category.income'),
          })}
          action={
            <Pill accent onClick={() => setShowForm(true)}>
              + {t('category.add')}
            </Pill>
          }
        />
      )}

      {/* 2-col mobile / 4-col desktop grid */}
      {!isLoading && visible.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {visible.map((cat) => (
            <CategoryCard
              key={cat.id}
              cat={cat as Category}
              onClick={() => setEditTarget(cat as EditTarget)}
            />
          ))}
          {/* Dashed add tile */}
          <AddCategoryTile onClick={() => setShowForm(true)} />
        </div>
      )}

      {/* Edit modal */}
      {editTarget && (
        <CategoryEditModal category={editTarget} onClose={() => setEditTarget(null)} />
      )}
    </div>
  )
}
