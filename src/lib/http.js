// Cliente HTTP por módulo: m1 = embarcaciones, m2 = reservas, m3 = finanzas.
// Las bases por defecto son rutas del mismo origen (p. ej. `/api/m3`) que el proxy de
// desarrollo de Vite redirige al backend correspondiente (ver vite.config.js).
const BASE_URLS = {
  m1: import.meta.env.VITE_API_M1_URL ?? '/api/m1',
  m2: import.meta.env.VITE_API_M2_URL ?? '/api/m2',
  m3: import.meta.env.VITE_API_M3_URL ?? '/api/m3',
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

export async function request(module, path, { method = 'GET', body, signal } = {}) {
  let res
  try {
    res = await fetch(`${BASE_URLS[module]}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json', Accept: 'application/json' } : { Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    toNetworkError(error)
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null)
  if (!res.ok) throw new ApiError(res.status, data)
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
