export const CHECKOUT_STORAGE_KEY = 'seashare.checkout.v1'
export const CHECKOUT_WINDOW_MS = 15 * 60 * 1000

export function remainingSeconds(expiresAt, now = Date.now()) {
  return Math.max(0, Math.ceil((expiresAt - now) / 1000))
}

// El snapshot contiene únicamente barco, fechas, pasajeros y la cotización de M2.
export function restoreCheckout(raw, snapshot, now = Date.now()) {
  try {
    const saved = JSON.parse(raw)
    if (saved?.version !== 1 || typeof saved.id !== 'string' || !saved.id
      || !Number.isFinite(saved.createdAt) || !Number.isFinite(saved.expiresAt)
      || saved.createdAt > now || saved.expiresAt - saved.createdAt !== CHECKOUT_WINDOW_MS
      || typeof saved.accepted !== 'boolean'
      || JSON.stringify(saved.snapshot) !== JSON.stringify(snapshot)) return null

    // Reconstruir explícitamente: nunca restaurar propiedades ajenas al contrato.
    return {
      version: 1, id: saved.id, createdAt: saved.createdAt,
      expiresAt: saved.expiresAt, accepted: saved.accepted, snapshot,
      reservationId: typeof saved.reservationId === 'string' ? saved.reservationId : null,
      idempotencyKey: typeof saved.idempotencyKey === 'string' ? saved.idempotencyKey : saved.id,
      requestFingerprint: /^[a-f0-9]{64}$/.test(saved.requestFingerprint ?? '') ? saved.requestFingerprint : null,
      requestStartedAt: Number.isFinite(saved.requestStartedAt) ? saved.requestStartedAt : null,
      departureTime: /^([01]\d|2[0-3]):[0-5]\d$/.test(saved.departureTime ?? '') ? saved.departureTime : '',
      serverExpiresAt: Number.isFinite(saved.serverExpiresAt) ? saved.serverExpiresAt : null,
      paymentStarted: saved.paymentStarted === true,
    }
  } catch {
    return null
  }
}

export function createCheckout(snapshot, now = Date.now()) {
  return {
    version: 1,
    id: crypto.randomUUID(),
    createdAt: now,
    expiresAt: now + CHECKOUT_WINDOW_MS,
    accepted: false,
    snapshot,
    reservationId: null, idempotencyKey: crypto.randomUUID(), requestFingerprint: null,
    requestStartedAt: null, departureTime: '', serverExpiresAt: null, paymentStarted: false,
  }
}

export function loadCheckout(storage, snapshot, now = Date.now()) {
  try {
    const restored = restoreCheckout(storage?.getItem(CHECKOUT_STORAGE_KEY), snapshot, now)
    if (restored) return restored
  } catch {
    // El checkout sigue funcionando en memoria si el navegador bloquea el storage.
  }
  return createCheckout(snapshot, now)
}

export function saveCheckout(storage, checkout) {
  try {
    storage?.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(checkout))
  } catch {
    // La persistencia no debe impedir navegar ni aceptar las políticas.
  }
}

// Solo una nueva acción explícita de «Reservar» permite reiniciar un plazo vencido.
export function clearExpiredCheckout(storage, now = Date.now()) {
  try {
    const saved = JSON.parse(storage?.getItem(CHECKOUT_STORAGE_KEY))
    if (Number.isFinite(saved?.expiresAt) && saved.expiresAt <= now) {
      storage.removeItem(CHECKOUT_STORAGE_KEY)
    }
  } catch {
    // Un registro inválido será reemplazado al entrar al resumen.
  }
}
