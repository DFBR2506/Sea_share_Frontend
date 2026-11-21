import { isUUID } from '@/lib/uuid'

// Alcance OWNER: el propietario es el usuario que inició sesión en M1 (su id coincide con el
// owner_id de los eventos de reservas que M2 publica a M3). VITE_M3_OWNER_ID queda solo como
// respaldo de desarrollo cuando no hay sesión de propietario.
const ENV_OWNER_ID = import.meta.env.VITE_M3_OWNER_ID ?? ''

export function currentOwnerId() {
  try {
    if (localStorage.getItem('seashare.role') === 'OWNER') {
      const sessionId = localStorage.getItem('seashare.userId')
      if (isUUID(sessionId)) return sessionId
    }
  } catch {
    // sin localStorage: se usa el respaldo de configuración
  }
  return ENV_OWNER_ID
}

export function requireOwnerId() {
  const ownerId = currentOwnerId()
  if (!isUUID(ownerId)) {
    throw new Error('No se pudo identificar al propietario: inicia sesión como propietario (o define VITE_M3_OWNER_ID en desarrollo).')
  }
  return ownerId
}
