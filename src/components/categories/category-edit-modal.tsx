import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories'
import { Button } from '@/components/ui/Button'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { CategoryForm, type CategoryFormData } from './category-form'

export function CategoryEditModal({
  category,
  onClose,
}: {
  category: { id: number } & CategoryFormData
  onClose: () => void
}) {
  const { t } = useTranslation()
  const update = useUpdateCategory()
  const del = useDeleteCategory()
  const [showDelete, setShowDelete] = useState(false)

  const handleUpdate = (data: CategoryFormData) => {
    update.mutate({ id: category.id, ...data }, {
      onSuccess: () => { toast.success(t('category.updated')); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  const handleDelete = () => {
    del.mutate(category.id, {
      onSuccess: () => { toast.success(t('category.deleted')); onClose() },
      onError: (e: Error) => toast.error(e.message),
    })
  }

  return (
    <BottomSheet open onClose={onClose} title={t('category.editCategory')}>
      <CategoryForm initial={category} onSubmit={handleUpdate} onCancel={onClose} isPending={update.isPending} />
      <div className="border-t border-line pt-3 mt-3">
        {showDelete ? (
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-negative text-center">
              {t('category.deleteConfirm', { name: category.name })}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowDelete(false)} className="flex-1">{t('common.cancel')}</Button>
              <Button onClick={handleDelete} disabled={del.isPending} className="flex-1 !bg-negative !text-white">
                {del.isPending ? t('common.deleting') : t('category.deleteCategory')}
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowDelete(true)}
            className="w-full text-center text-[11px] font-bold text-negative hover:underline py-1 uppercase tracking-wide"
          >
            {t('category.deleteCategory')}
          </button>
        )}
      </div>
    </BottomSheet>
  )
}
