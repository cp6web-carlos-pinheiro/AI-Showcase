import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/cn'
import { formatNumber, formatPercent } from '@/lib/format'

interface StatCardProps {
  label: string
  value: number
  change: number
  icon: LucideIcon
  comparisonLabel?: string
  className?: string
}

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  comparisonLabel = 'last month',
  className,
}: StatCardProps) {
  const isPositive = change >= 0
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight

  return (
    <Card className={cn('flex flex-col gap-4 p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <p className="truncate text-sm font-medium text-muted">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{formatNumber(value)}</p>
        </div>

        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-surface shadow-xs">
          <Icon className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
      </div>

      <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
        <span
          className={cn(
            'inline-flex items-center gap-1 font-semibold',
            isPositive ? 'text-success' : 'text-danger',
          )}
        >
          <TrendIcon className="size-3.5" strokeWidth={2.25} aria-hidden />
          {formatPercent(change)}
        </span>
        <span className="text-muted">
          {isPositive ? 'Higher' : 'Lower'} than {comparisonLabel}
        </span>
      </p>
    </Card>
  )
}
