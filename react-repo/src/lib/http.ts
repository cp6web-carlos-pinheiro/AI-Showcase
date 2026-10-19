import { env } from '@/config/env'

export class HttpError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

/** Cliente HTTP mínimo sobre fetch. Retorna o JSON cru (DTO) — a conversão fica no mapper de cada feature. */
export async function httpGet<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    method: 'GET',
    headers: { Accept: 'application/json', ...init?.headers },
  })

  if (!response.ok) {
    throw new HttpError(response.status, `GET ${path} falhou com status ${response.status}`)
  }

  return response.json() as Promise<T>
}
