import { BOATS, RESERVATIONS } from './mocks'
import { OWNER_RESERVATIONS, SEED_DISPUTES } from './ownerMocks'

// Capa de acceso a datos del módulo 2. Hoy devuelve mocks; al llegar los contratos
// solo se cambia el cuerpo de estas funciones por `request('m2', ...)`.
// Las estimaciones reales de precio (M3) se acceden desde features/finance.
export { boatUuid } from './boatUuids'

const delay = (value, ms = 250) => new Promise((resolve) => setTimeout(() => resolve(value), ms))

export const listBoats = () => delay(BOATS)

export const getBoat = (id) => delay(BOATS.find((b) => b.id === id) ?? null)

export const listReservations = () => delay(RESERVATIONS)

export const getReservation = (id) => delay(RESERVATIONS.find((r) => r.id === id) ?? null)

// ---- Lado Propietario / Administrador (store en memoria) ----
let ownerReservations = OWNER_RESERVATIONS.map((r) => ({ ...r }))
let disputes = SEED_DISPUTES.map((d) => ({ ...d }))
const clone = (v) => delay(structuredClone(v))
const patchReservation = (id, changes) => {
  ownerReservations = ownerReservations.map((r) => (r.id === id ? { ...r, ...changes } : r))
  return clone(ownerReservations.find((r) => r.id === id))
}

export const listOwnerReservations = () => clone(ownerReservations)
export const getOwnerReservation = (id) => clone(ownerReservations.find((r) => r.id === id) ?? null)

export const startNavigation = (id) => patchReservation(id, { status: 'EN_NAVEGACION', phase: undefined, realDeparture: 'hoy, 14:38' })
export const endNavigation = (id) => patchReservation(id, { status: 'COMPLETADA', realArrival: 'hoy, 12:15' })
export const markNoShow = (id) => patchReservation(id, { status: 'CANCELADA', phase: undefined, cancelNote: 'Inasistencia del arrendatario' })
export const cancelByHost = (id, { reason, justification }) =>
  patchReservation(id, { status: 'CANCELADA', phase: undefined, cancelNote: 'Cancelación por anfitrión', cancelReason: reason, cancelJustification: justification })

export const submitClaim = async (id, text) => {
  const r = ownerReservations.find((x) => x.id === id)
  const boat = BOATS.find((b) => b.id === r.boatId)
  const nextNumber = 2014 + disputes.length + 10
  disputes = [...disputes, { id: `D-${nextNumber}`, reservationId: id, code: `RSV-2026-${id.replace('RS-', '0')}`, boatName: boat.name, guest: r.guest, host: boat.host.name, claim: text, closing: 'Sin novedades reportadas por el Arrendatario al momento de la entrega.', status: 'PENDIENTE', hoursLeft: 24 }]
  return patchReservation(id, { claim: { text, sentAt: 'hoy', status: 'PENDIENTE' } })
}

export const listDisputes = () => clone(disputes)
export const resolveDispute = (id, { accepted, note }) => {
  disputes = disputes.map((d) => (d.id === id ? { ...d, status: 'RESUELTA', accepted, note } : d))
  const d = disputes.find((x) => x.id === id)
  if (d.reservationId) ownerReservations = ownerReservations.map((r) => (r.id === d.reservationId && r.claim ? { ...r, claim: { ...r.claim, status: accepted ? 'ACEPTADO' : 'RECHAZADO' } } : r))
  return clone(d)
}
