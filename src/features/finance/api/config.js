import { isUUID } from '@/lib/uuid'

// Alcance OWNER sin autenticación real: el propietario se declara por configuración y debe
// coincidir con el owner_id de los eventos de reservas que M2 publica a M3. Sin un UUID válido no
// se hacen consultas de propietario (decisión acordada de la integración M3).
export const OWNER_ID = import.meta.env.VITE_M3_OWNER_ID ?? ''

export function requireOwnerId() {
  if (!isUUID(OWNER_ID)) {
    throw new Error('Falta una configuración válida: define VITE_M3_OWNER_ID con el UUID del propietario (alcance OWNER).')
  }
  return OWNER_ID
}
