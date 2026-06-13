import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWishlistItems } from '@/hooks/use-wishlist'
import { Amount, SectionLabel } from '@/design-system'
import { Card } from '@/components/ui/Card'
import type { WishlistPriority } from '@/types'

const PRIORITY_COLOR: Record<WishlistPriority, string> = {
  HIGH:   'bg-negative',
  MEDIUM: 'bg-warning',
  LOW:    'bg-positive',
}

export function ZoneWishlist() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: items } = useWishlistItems('SAVING')

  if (!items || items.length === 0) return null

  const top3 = items.slice(0, 3)

  return (
    <div className="space-y-2">
      <SectionLabel
        right={
          <button
            onClick={() => navigate('/wishlist')}
            className="hover:text-primary transition-colors min-h-[44px] px-1 flex items-center"
          >
            {t('common.viewAll')} →
          </button>
        }
      >
        {t('nav.wishlist')}
      </SectionLabel>

      <Card padding="none">
        {top3.map((item, i) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 hover:bg-hover transition-colors ${
              i < top3.length - 1 ? 'border-b border-line' : ''
            }`}
          >
            {/* Priority dot */}
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_COLOR[item.priority]}`}
              aria-hidden="true"
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{item.name}</p>
              {item.targetDate && (
                <p className="text-[10px] font-semibold text-muted mt-0.5">
                  {new Date(item.targetDate).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>

            {item.estimatedPrice != null && (
              <Amount
                value={item.estimatedPrice}
                size={13}
                weight={600}
                className="text-primary"
                style={{ color: 'var(--primary)' }}
              />
            )}
          </div>
        ))}
      </Card>
    </div>
  )
}
