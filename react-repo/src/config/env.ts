/** Variáveis de ambiente tipadas e com valores padrão — único ponto de leitura de import.meta.env. */
export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  useMocks: (import.meta.env.VITE_USE_MOCKS ?? 'true') === 'true',
} as const
