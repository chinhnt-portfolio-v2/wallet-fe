import { useTranslation } from 'react-i18next'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'

const PRESET_PREVIEW = [
  { nameKey: 'budget.jarEssentials', pct: 55, icon: '🏠', color: '#0EA5E9' },
  { nameKey: 'budget.jarEducation',  pct: 10, icon: '📚', color: '#8B5CF6' },
  { nameKey: 'budget.jarSavings',    pct: 10, icon: '💰', color: '#10B981' },
  { nameKey: 'budget.jarPlay',       pct: 10, icon: '🎮', color: '#F97316' },
  { nameKey: 'budget.jarInvest',     pct: 10, icon: '📈', color: '#14B8A6' },
  { nameKey: 'budget.jarGive',       pct: 5,  icon: '🎁', color: '#F472B6' },
]

interface JarPresetModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
}

export function JarPresetModal({ open, onClose, onConfirm, isPending }: JarPresetModalProps) {
  const { t } = useTranslation()
  return (
    <BottomSheet open={open} onClose={onClose} title={t('budget.jarPresetTitle')}>
      <div className="space-y-4">
        <p className="text-sm text-secondary">
          {t('budget.jarPresetDesc')}
        </p>

        <div className="space-y-2">
          {PRESET_PREVIEW.map((jar) => (
            <div
              key={jar.nameKey}
              className="flex items-center justify-between py-2 px-3 rounded-lg"
              style={{ backgroundColor: `${jar.color}12` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{jar.icon}</span>
                <span className="text-sm font-medium text-primary">{t(jar.nameKey)}</span>
              </div>
              <span
                className="text-sm font-bold"
                style={{ color: jar.color }}
              >
                {jar.pct}%
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted">
          {t('budget.jarPresetTotal')}
        </p>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">{t('common.cancel')}</Button>
          <Button onClick={onConfirm} disabled={isPending} className="flex-1">
            {isPending ? t('common.processing') : t('budget.jarPresetConfirm')}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
