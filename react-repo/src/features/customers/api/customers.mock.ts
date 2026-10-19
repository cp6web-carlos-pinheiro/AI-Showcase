import type { CustomerMetricsResponseDTO } from './customers.dto'

// Mock no formato DTO (igual ao backend) para que o mapper seja exercitado também em dev.
export const customerMetricsMock: CustomerMetricsResponseDTO = {
  data: [
    {
      metric_key: 'total-customers',
      display_name: 'Total Customer',
      current_value: 86_435,
      change_percentage: 2.5,
    },
    {
      metric_key: 'new-customers',
      display_name: 'New Customer',
      current_value: 4_850,
      change_percentage: 2.86,
    },
    {
      metric_key: 'repeat-customers',
      display_name: 'Repeat Customer',
      current_value: 2_695,
      change_percentage: -0.12,
    },
    {
      metric_key: 'churned-customers',
      display_name: 'Churned Customers',
      current_value: 2_520,
      change_percentage: 4.3,
    },
    {
      metric_key: 'active-customers',
      display_name: 'Active Customers',
      current_value: 62_660,
      change_percentage: 12.3,
    },
  ],
}

export async function fetchCustomerMetricsMock(): Promise<CustomerMetricsResponseDTO> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return structuredClone(customerMetricsMock)
}
