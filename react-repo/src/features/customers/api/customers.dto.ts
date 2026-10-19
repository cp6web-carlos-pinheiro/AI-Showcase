/**
 * Contrato da API (Data Transfer Objects).
 * Espelha exatamente o JSON do backend — nunca usar estes tipos fora da camada `api/`.
 */
export interface CustomerMetricDTO {
  metric_key: string
  display_name: string
  current_value: number | string
  change_percentage: number | string | null
}

export interface CustomerMetricsResponseDTO {
  data: CustomerMetricDTO[]
}
