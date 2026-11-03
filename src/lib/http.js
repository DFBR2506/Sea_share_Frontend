// Cliente HTTP por módulo: m1 = embarcaciones, m2 = reservas, m3 = finanzas.
const BASE_URLS = {
  m1: import.meta.env.VITE_API_M1_URL ?? '/api/m1',
  m2: import.meta.env.VITE_API_M2_URL ?? '/api/m2',
  m3: import.meta.env.VITE_API_M3_URL ?? '/api/m3',
}

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message ?? `Error ${status}`)
    this.status = status
    this.body = body
  }
}

export async function request(module, path, { method = 'GET', body, signal } = {}) {
  const res = await fetch(`${BASE_URLS[module]}${path}`, {
    method,
    signal,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, data)
  return data
}
