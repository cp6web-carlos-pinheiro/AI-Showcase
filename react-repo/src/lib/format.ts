const LOCALE = 'en-US'

export const formatNumber = (value: number) => new Intl.NumberFormat(LOCALE).format(value)

export const formatPercent = (value: number) =>
  new Intl.NumberFormat(LOCALE, { style: 'percent', maximumFractionDigits: 2 }).format(
    Math.abs(value) / 100,
  )
