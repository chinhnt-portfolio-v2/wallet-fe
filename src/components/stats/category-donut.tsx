import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import type { CategorySpend } from '@/hooks/useStats'

const FALLBACK_COLOR = '#94a3b8'

interface CategoryDonutProps {
  data: CategorySpend[]
  ariaLabel?: string
}

/** Donut chart of expense share by category. Colors come from each category. */
export function CategoryDonut({ data, ariaLabel }: CategoryDonutProps) {
  const chartData = data.map((d) => ({
    name: d.name ?? '—',
    value: d.total,
    color: d.color ?? FALLBACK_COLOR,
  }))

  return (
    <div role="img" aria-label={ariaLabel ?? 'Spending by category'} className="w-full">
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={2}
            stroke="none"
            isAnimationActive={false}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
