import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWishlistItems } from '@/hooks/use-wishlist'
import { formatCurrency } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import type { WishlistPriority } from '@/types'

const PRIORITY_DOT: Record<WishlistPriority, string> = {
  HIGH:   'bg-red-500',
  MEDIUM: 'bg-yellow-400',
  LOW:    'bg-green-500',
}

export function ZoneWishlist() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { data: items } = useWishlistItems('SAVING')

  if (!items || items.length === 0) return null

  const top3 = items.slice(0, 3)

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-widest text-faint">
          🎯 {t('nav.wishlist')}
        </p>
        <button
          onClick={() => navigate('/wishlist')}
          className="font-mono text-[10px] uppercase tracking-widest text-accent hover:text-primary transition-colors min-h-[44px] px-1"
        >
          {t('common.viewAll')} →
        </button>
      </div>
      <Card padding="none">
        {top3.map((item, i) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 p-3 ${i < top3.length - 1 ? 'border-b border-border' : ''}`}
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[item.priority]}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{item.name}</p>
              {item.targetDate && (
                <p className="font-mono text-[10px] text-muted mt-0.5">
                  🗓 {new Date(item.targetDate).toLocaleDateString('vi-VN')}
                </p>
              )}
            </div>
            {item.estimatedPrice != null && (
              <p className="text-sm font-semibold text-accent font-mono tabular-nums whitespace-nowrap">
                {formatCurrency(item.estimatedPrice)}
              </p>
            )}
          </div>
        ))}
      </Card>
    </div>
  )
}
