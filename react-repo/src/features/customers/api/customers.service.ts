import { env } from '@/config/env'
import { httpGet } from '@/lib/http'
import type { Metric } from '@/types/metric'
import type { CustomerMetricsResponseDTO } from './customers.dto'
import { toMetrics } from './customers.mapper'
import { fetchCustomerMetricsMock } from './customers.mock'

const ENDPOINTS = {
  metrics: '/customers/metrics',
} as const

/** Ponto de entrada da UI: sempre devolve modelo de domínio, independente da origem dos dados. */
export async function getCustomerMetrics(): Promise<Metric[]> {
  const response = env.useMocks
    ? await fetchCustomerMetricsMock()
    : await httpGet<CustomerMetricsResponseDTO>(ENDPOINTS.metrics)

  return toMetrics(response)
}
