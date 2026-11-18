// Cliente HTTP por módulo: m1 = embarcaciones, m2 = reservas, m3 = finanzas.
const BASE_URLS = {
  m1: import.meta.env.VITE_API_M1_URL ?? '/api/m1',
  m2: import.meta.env.VITE_API_M2_URL ?? '/api/m2',
  m3: import.meta.env.VITE_API_M3_URL ?? '/api/m3',
}

// Identidad provisional desde localStorage (seashare.*); si falta, no se manda nada.
function readIdentityHeaders(module) {
  let userId = null
  let role = null
  try {
    userId = localStorage.getItem('seashare.userId')
    role = localStorage.getItem('seashare.role')
  } catch {
    // sin localStorage: la petición sale sin identidad
  }
  const headers = {}
  if (userId) headers['X-User-Id'] = userId
  if (role) {
    // FINADMIN es vocabulario de la UI; el backend M2 solo conoce FINANCE
    headers['X-User-Role'] = module === 'm2' && role === 'FINADMIN' ? 'FINANCE' : role
  }
  return headers
}

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message ?? `Error ${status}`)
    this.status = status
    this.code = body?.code ?? null // código estable del cuerpo; null si no viene
    this.body = body
  }
}

export async function request(module, path, { method = 'GET', body, signal, headers: extraHeaders } = {}) {
  // Identidad + headers extra del llamador (ej. Idempotency-Key)
  const headers = { ...readIdentityHeaders(module), ...extraHeaders }
  // El Content-Type del JSON manda: no lo pisa quien llame
  if (body) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${BASE_URLS[module]}${path}`, {
    method,
    signal,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, data)
  return data
}
