// Cliente HTTP por módulo: m1 = embarcaciones, m2 = reservas, m3 = finanzas.
const BASE_URLS = {
  m1: import.meta.env.VITE_API_M1_URL ?? '/api/m1',
  m2: import.meta.env.VITE_API_M2_URL ?? '/api/m2',
  m3: import.meta.env.VITE_API_M3_URL ?? '/api/m3',
}

// Errores en formato Problem Details (RFC 9457) con `code`, `retryable` y `errors[]` opcionales.
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.detail ?? body?.message ?? `Error ${status}`)
    this.status = status
    this.body = body
    this.code = body?.code
    this.retryable = body?.retryable ?? false
    this.errors = body?.errors ?? []
  }
}

export async function request(module, path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(`${BASE_URLS[module]}${path}`, {
    method,
    signal,
    headers: body ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, data)
  return data
}

// Descarga de archivos (p. ej. CSV). Los errores siguen llegando como Problem Details en JSON.
export async function requestFile(module, path, { accept, signal } = {}) {
  const res = await fetch(`${BASE_URLS[module]}${path}`, { signal, headers: { Accept: accept } })
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null))
  const filename = res.headers.get('Content-Disposition')?.match(/filename="?([^";]+)"?/)?.[1]
  return { blob: await res.blob(), filename }
}
