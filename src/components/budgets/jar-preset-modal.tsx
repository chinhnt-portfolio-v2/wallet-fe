import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'

const PRESET_PREVIEW = [
  { name: 'Nhu cầu thiết yếu', pct: 55, icon: '🏠', color: '#0EA5E9' },
  { name: 'Giáo dục', pct: 10, icon: '📚', color: '#8B5CF6' },
  { name: 'Tiết kiệm', pct: 10, icon: '💰', color: '#10B981' },
  { name: 'Giải trí', pct: 10, icon: '🎮', color: '#F97316' },
  { name: 'Đầu tư', pct: 10, icon: '📈', color: '#14B8A6' },
  { name: 'Cho tặng', pct: 5, icon: '🎁', color: '#F472B6' },
]

interface JarPresetModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
}

export function JarPresetModal({ open, onClose, onConfirm, isPending }: JarPresetModalProps) {
  return (
    <BottomSheet open={open} onClose={onClose} title="Thiết lập 6 hũ ngân sách">
      <div className="space-y-4">
        <p className="text-sm text-secondary">
          Phương pháp 6 hũ phân bổ thu nhập hàng tháng theo tỷ lệ cố định.
          Bạn có thể chỉnh sửa sau khi tạo.
        </p>

        <div className="space-y-2">
          {PRESET_PREVIEW.map((jar) => (
            <div
              key={jar.name}
              className="flex items-center justify-between py-2 px-3 rounded-lg"
              style={{ backgroundColor: `${jar.color}12` }}
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{jar.icon}</span>
                <span className="text-sm font-medium text-primary">{jar.name}</span>
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
          Tổng: 100% — mỗi hũ được tính dựa trên thu nhập thực tế trong tháng.
        </p>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Hủy</Button>
          <Button onClick={onConfirm} disabled={isPending} className="flex-1">
            {isPending ? 'Đang tạo...' : 'Tạo 6 hũ'}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
