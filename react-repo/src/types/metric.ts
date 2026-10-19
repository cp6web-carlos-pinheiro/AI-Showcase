export type TrendDirection = 'up' | 'down'

export interface Metric {
  id: string
  label: string
  value: number
  /** Variação percentual em relação ao período anterior (ex.: 2.5 = +2,5%). */
  change: number
}
