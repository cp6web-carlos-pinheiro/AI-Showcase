import type { Metric } from '@/types/metric'
import type { CustomerMetricDTO, CustomerMetricsResponseDTO } from './customers.dto'

const toNumber = (value: number | string | null | undefined, fallback = 0) => {
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : fallback
}

/** Converte o DTO da API para o modelo de domínio usado pela UI. */
export function toMetric(dto: CustomerMetricDTO): Metric {
  return {
    id: dto.metric_key,
    label: dto.display_name,
    value: toNumber(dto.current_value),
    change: toNumber(dto.change_percentage),
  }
}

export function toMetrics(response: CustomerMetricsResponseDTO): Metric[] {
  return (response.data ?? []).map(toMetric)
}
