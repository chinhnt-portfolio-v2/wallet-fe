import { useTranslation } from 'react-i18next'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'

/**
 * 6-jar preset preview.
 * NEC/FFA/EDU/PLAY/GIVE/LTSS — % badges colored per jar.
 * No lucide icons needed here; jar icons are emoji from the server preset.
 */
const PRESET_PREVIEW = [
  { nameKey: 'budget.jarEssentials', abbr: 'NEC', pct: 55, icon: '🏠', color: '#0EA5E9' },
  { nameKey: 'budget.jarSavings',    abbr: 'FFA', pct: 10, icon: '💰', color: '#10B981' },
  { nameKey: 'budget.jarEducation',  abbr: 'EDU', pct: 10, icon: '📚', color: '#8B5CF6' },
  { nameKey: 'budget.jarPlay',       abbr: 'PLAY', pct: 10, icon: '🎮', color: '#F97316' },
  { nameKey: 'budget.jarGive',       abbr: 'GIVE', pct: 5,  icon: '🎁', color: '#F472B6' },
  { nameKey: 'budget.jarInvest',     abbr: 'LTSS', pct: 10, icon: '📈', color: '#14B8A6' },
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
        <p className="text-[13px] text-sub">{t('budget.jarPresetDesc')}</p>

        <div className="space-y-2">
          {PRESET_PREVIEW.map((jar) => (
            <div
              key={jar.nameKey}
              className="flex items-center justify-between px-3 py-2.5 rounded-sm border border-line"
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-8 h-8 rounded-xs flex items-center justify-center text-sm shrink-0"
                  style={{ backgroundColor: `${jar.color}20` }}
                >
                  {jar.icon}
                </div>
                <div>
                  <p className="text-[12px] font-semibold text-ink">{t(jar.nameKey)}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                    {jar.abbr}
                  </p>
                </div>
              </div>
              <span
                className="text-[13px] font-extrabold tabular-nums px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${jar.color}18`, color: jar.color }}
              >
                {jar.pct}%
              </span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-muted">{t('budget.jarPresetTotal')}</p>

        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {t('common.cancel')}
          </Button>
          <Button onClick={onConfirm} disabled={isPending} className="flex-1">
            {isPending ? t('common.processing') : t('budget.jarPresetConfirm')}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
