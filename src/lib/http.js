// Cliente HTTP por módulo: m1 = embarcaciones, m2 = reservas, m3 = finanzas.
// Las bases por defecto son rutas del mismo origen (p. ej. `/api/m3`) que el proxy de
// desarrollo de Vite redirige al backend correspondiente (ver vite.config.js).
const BASE_URLS = {
  m1: import.meta.env.VITE_API_M1_URL ?? '/api/m1',
  m2: import.meta.env.VITE_API_M2_URL ?? '/api/m2',
  m3: import.meta.env.VITE_API_M3_URL ?? '/api/m3',
}

// Identidad desde localStorage (seashare.*); si falta, no se manda nada.
// M1 autentica con el JWT del login; M2 y M3 reciben la identidad en cabeceras X-User-*.
function readIdentityHeaders(module) {
  let userId = null
  let role = null
  let token = null
  try {
    userId = localStorage.getItem('seashare.userId')
    role = localStorage.getItem('seashare.role')
    token = localStorage.getItem('seashare.token')
  } catch {
    // sin localStorage: la petición sale sin identidad
  }
  const headers = {}
  if (module === 'm1') {
    if (token) headers.Authorization = `Bearer ${token}`
    return headers
  }
  if (userId) headers['X-User-Id'] = userId
  if (role) {
    // FINADMIN es vocabulario de la UI; el backend M2 solo conoce FINANCE
    headers['X-User-Role'] = module === 'm2' && role === 'FINADMIN' ? 'FINANCE' : role
  }
  return headers
}

// Errores de negocio del servidor en formato Problem Details (RFC 9457) con `code`,
// `retryable` y `errors[]` opcionales.
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.detail ?? body?.message ?? `Error ${status}`)
    this.status = status
    this.body = body
    this.code = body?.code
    this.retryable = body?.retryable ?? false
    this.errors = body?.errors ?? []
  }

  /** ¿Es el error de contrato con ese código? (p. ej. `error.isCode('PAGE_OUT_OF_RANGE')`) */
  isCode(code) {
    return this.code === code
  }

  /** Mensaje del servidor para un campo del cuerpo (`errors[{ field, message }]`). */
  fieldError(field) {
    return this.errors.find((e) => e.field === field)?.message
  }
}

// Fallo de red/conexión (fetch rechazado): distinto de un error de negocio del servidor.
export class NetworkError extends Error {
  constructor(cause) {
    super('No se pudo conectar con el servidor. Comprueba que el backend esté levantado y vuelve a intentarlo.')
    this.name = 'NetworkError'
    this.retryable = true
    this.cause = cause
  }
}

function toNetworkError(error) {
  if (error?.name === 'AbortError') throw error // La cancelación no es un fallo de red.
  throw new NetworkError(error)
}

// Token de M1 vencido o inválido: se limpia la sesión y se vuelve al login.
function expireSession() {
  try {
    ;['seashare.token', 'seashare.role', 'seashare.userId'].forEach((key) => localStorage.removeItem(key))
  } catch {
    // nada que limpiar
  }
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') window.location.assign('/login')
}

export async function request(module, path, { method = 'GET', body, signal, headers: extraHeaders } = {}) {
  const headers = { Accept: 'application/json', ...readIdentityHeaders(module), ...extraHeaders }
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData
  if (body && !isForm) headers['Content-Type'] = 'application/json'
  let res
  try {
    res = await fetch(`${BASE_URLS[module]}${path}`, {
      method,
      signal,
      headers,
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    })
  } catch (error) {
    toNetworkError(error)
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) {
    if (module === 'm1' && res.status === 401 && !path.startsWith('/api/v1/auth/')) expireSession()
    throw new ApiError(res.status, data)
  }
  return data
}

// Descarga de archivos (p. ej. CSV). Los errores siguen llegando como Problem Details en JSON.
export async function requestFile(module, path, { accept, signal } = {}) {
  let res
  try {
    res = await fetch(`${BASE_URLS[module]}${path}`, { signal, headers: { Accept: accept } })
  } catch (error) {
    toNetworkError(error)
  }
  if (!res.ok) throw new ApiError(res.status, await res.json().catch(() => null))
  const filename = res.headers.get('Content-Disposition')?.match(/filename="?([^";]+)"?/)?.[1]
  return { blob: await res.blob(), filename }
}
