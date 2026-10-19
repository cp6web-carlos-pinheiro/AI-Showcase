import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { getMetricIcon } from '../config/metric-icons'
import { useCustomerMetrics } from '../hooks/use-customer-metrics'
import { AddCustomerButton } from './add-customer-button'

const SKELETON_COUNT = 5

export function CustomerOverview() {
  const { data, error, isLoading } = useCustomerMetrics()

  return (
    <section aria-labelledby="customer-heading" className="flex flex-col gap-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h2 id="customer-heading" className="text-2xl font-semibold tracking-tight">
          Customer
        </h2>
        <AddCustomerButton />
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {isLoading ? (
          Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <Card key={i} className="h-[132px] animate-pulse" aria-busy />
          ))
        ) : error ? (
          <Card role="alert" className="col-span-full text-sm text-danger">
            Não foi possível carregar as métricas de clientes.
          </Card>
        ) : (
          data.map((metric) => (
            <StatCard
              key={metric.id}
              label={metric.label}
              value={metric.value}
              change={metric.change}
              icon={getMetricIcon(metric.id)}
            />
          ))
        )}
      </div>
    </section>
  )
}
