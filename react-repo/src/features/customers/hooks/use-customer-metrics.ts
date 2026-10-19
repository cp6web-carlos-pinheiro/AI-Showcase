import { useEffect, useState } from 'react'
import type { Metric } from '@/types/metric'
import { getCustomerMetrics } from '../api/customers.service'

export function useCustomerMetrics() {
  const [data, setData] = useState<Metric[]>([])
  const [error, setError] = useState<Error | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    getCustomerMetrics()
      .then((metrics) => active && setData(metrics))
      .catch((err: unknown) => active && setError(err instanceof Error ? err : new Error(String(err))))
      .finally(() => active && setIsLoading(false))
    return () => {
      active = false
    }
  }, [])

  return { data, error, isLoading }
}
