import { useId } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
} from 'recharts'
import type { MonthlyStats } from '@/hooks/useDashboard'

interface CashflowChartProps {
  data: MonthlyStats[]
  reducedMotion?: boolean
  /** aria-label summary for screen readers */
  ariaLabel?: string
}

interface TooltipPayload {
  name: string
  value: number
  color: string
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div
      className="bg-surface border border-line rounded-lg px-3 py-2 shadow-pop text-[11px]"
      role="status"
    >
      <p className="font-extrabold text-muted uppercase tracking-[0.07em] mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="tabular-nums font-semibold" style={{ color: entry.color }}>
          {entry.name}:{' '}
          {new Intl.NumberFormat('vi-VN').format(Math.round(entry.value))}₫
        </p>
      ))}
    </div>
  )
}

export function CashflowChart({ data, reducedMotion = false, ariaLabel }: CashflowChartProps) {
  const incomeGradId = useId()
  const expenseGradId = useId()

  if (!data || data.length === 0) return null

  const chartData = data.map((m) => ({
    label: m.label,
    income: m.totalIncome,
    expense: m.totalExpense,
  }))

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? 'Cashflow chart: income vs expense over 6 months'}
      className="w-full"
    >
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id={incomeGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--positive)" stopOpacity={0.24} />
              <stop offset="100%" stopColor="var(--positive)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id={expenseGradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--negative)" stopOpacity={0.24} />
              <stop offset="100%" stopColor="var(--negative)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 600, fill: 'var(--muted)', letterSpacing: '0.05em' }}
            interval={0}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--line)', strokeWidth: 1 }} />

          <Area
            type="monotone"
            dataKey="income"
            name="Thu"
            stroke="var(--positive)"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={`url(#${incomeGradId})`}
            dot={false}
            isAnimationActive={!reducedMotion}
            style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties}
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Chi"
            stroke="var(--negative)"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill={`url(#${expenseGradId})`}
            dot={false}
            isAnimationActive={!reducedMotion}
            style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
