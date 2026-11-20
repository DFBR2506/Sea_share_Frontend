import { request } from '../../../lib/http'
import { mapVessel } from './vesselMapper'
import { mapReservation } from './reservationMapper'
import { mapReservationStatus } from './statusMap'

// Capa de acceso a datos del modulo 2 que habla con M2 real.
// Las estimaciones reales de precio (M3) se acceden desde features/finance.
export { boatUuid } from './boatUuids'

export const listBoats = async ({ passengers, type, startDate, endDate, includePagination = false, signal } = {}) => {
  const vessels = []
  let pagination
  let page = 1
  let totalPages
  do {
    const query = new URLSearchParams({ page: String(page) })
    if (passengers != null && passengers !== '') query.set('passengers', String(passengers))
    if (type) query.set('type', type)
    if (startDate && endDate) {
      query.set('start_date', startDate)
      query.set('end_date', endDate)
    }
    const data = await request('m2', `/api/v1/vessels?${query}`, { signal })
    if (!Array.isArray(data?.vessels)) throw new Error('La respuesta no contiene vessels como arreglo')
    if (!Number.isInteger(data.pagination?.total_pages) || data.pagination.total_pages < 0) throw new Error('La respuesta no contiene una paginación válida')
    vessels.push(...data.vessels.map(mapVessel))
    pagination ??= data.pagination
    totalPages = data.pagination.total_pages
    page += 1
  } while (page <= totalPages)
  return includePagination ? { vessels, pagination } : vessels
}

export const getBoat = (id) => request('m2', `/api/v1/vessels/${id}`).then(mapVessel)

export const getQuotation = (id, startDate, endDate, passengers) => {
  const query = new URLSearchParams({ start_date: startDate, end_date: endDate, passengers: String(passengers) })
  return request('m2', `/api/v1/vessels/${id}/quotations?${query}`)
}

export const createReservation = (body, idempotencyKey) => request('m2', '/api/v1/reservations', {
  method: 'POST', body, headers: { 'Idempotency-Key': idempotencyKey },
})

export const listReservations = () => request('m2', '/api/v1/reservations').then((data) => data.reservations.map(mapReservation))

export const getReservation = (id) => request('m2', `/api/v1/reservations/${id}`).then(mapReservation)

export const cancelReservation = (id) => request('m2', `/api/v1/reservations/${id}/cancellation`, { method: 'POST' })

// ---- Lado Propietario / Administrador ----
export const listOwnerReservations = () => request('m2', '/api/v1/reservations').then((data) => data.reservations.map(mapReservation))
export const getOwnerReservation = (id) => request('m2', `/api/v1/reservations/${id}`).then((data) => ({
  ...mapReservation(data),
  boat: {
    name: data.vessel?.name ?? '',
    type: data.vessel?.type ?? '',
    imageUrl: data.vessel?.image_url ?? '',
    amenities: data.vessel?.included_services ?? [],
    location: data.itinerary?.departure_port?.name ?? '',
    shortLocation: data.itinerary?.departure_port?.name ?? '',
  },
}))

export const startNavigation = (id) => request('m2', `/api/v1/reservations/${id}/navigation-start`, { method: 'POST' }).then((data) => ({
  id: data.reservation_id,
  boatId: data.vessel_id,
  status: mapReservationStatus(data.status),
  phase: undefined,
  realDeparture: data.actual_departure_at ?? '',
}))
export const endNavigation = (id) => request('m2', `/api/v1/reservations/${id}/navigation-end`, { method: 'POST' }).then((data) => ({
  id: data.reservation_id,
  boatId: data.vessel_id,
  status: mapReservationStatus(data.status),
  realArrival: data.actual_arrival_at ?? '',
}))
export const markNoShow = (id) => request('m2', `/api/v1/reservations/${id}/no-show`, { method: 'POST' }).then((data) => ({
  id: data.reservation_id,
  boatId: data.vessel_id,
  status: mapReservationStatus(data.status),
  phase: undefined,
  cancelNote: data.message ?? '',
}))
export const cancelByHost = (id, { reason, justification }) =>
  request('m2', `/api/v1/reservations/${id}/cancellation`, {
    method: 'POST',
    body: { reason: ({ FUERZA_MAYOR: 'logistics_force_majeure', AVERIA: 'mechanical_failure' })[reason] ?? reason, justification },
  }).then((data) => ({
    id: data.reservation_id,
    boatId: data.vessel_id,
    status: mapReservationStatus(data.status),
    phase: undefined,
    cancelNote: data.message ?? '',
    cancelReason: data.reason ?? '',
    cancelJustification: data.justification ?? '',
  }))

export const submitClaim = async (id, text) => {
  return request('m2', `/api/v1/disputes/${id}/claims`, { method: 'POST', body: { description: text } })
}

export const listDisputes = ({ reservationId, signal } = {}) => {
  const query = reservationId ? `?${new URLSearchParams({ reservation_id: reservationId })}` : ''
  return request('m2', `/api/v1/disputes${query}`, { signal }).then((data) => data.disputes.map((dispute) => ({
    id: dispute.dispute_id,
    reservationId: dispute.reservation_id,
    status: dispute.status,
    windowStart: dispute.window_start,
    windowEnd: dispute.window_end,
    claim: dispute.claim?.description ?? null,
    claimData: dispute.claim ?? null,
  })))
}
export const resolveDispute = (id, { accepted, note, internalNotes }) => {
  return request('m2', `/api/v1/disputes/${id}/status`, {
    method: 'PUT',
    body: {
      new_status: accepted ? 'ACCEPTED' : 'REJECTED',
      ...(note ? { reason: note } : {}),
      ...(internalNotes ? { internal_notes: internalNotes } : {}),
    },
  })
}
