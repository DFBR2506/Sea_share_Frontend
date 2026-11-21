import { ApiError, request } from '@/lib/http'
import { mapDraft, mapListItem, mapOwner, mapVessel, servicesFlags, toApiStatus } from './mappers'

// Capa de acceso del módulo 1 (flota). Propietario: /api/v1/fleet; administrador: /api/v1/admin.
const FLEET = '/api/v1/fleet/boats'
const ADMIN = '/api/v1/admin/fleet'
const base = (admin) => (admin ? `${ADMIN}/boats` : FLEET)

export const listOwnerVessels = () => request('m1', FLEET).then((data) => data.boats.map(mapListItem))

export const listAllVessels = ({ ownerId, status, query } = {}) => {
  const params = new URLSearchParams()
  if (ownerId) params.set('owner_id', ownerId)
  if (status) params.set('status', toApiStatus(status))
  if (query) params.set('q', query)
  const qs = params.size ? `?${params}` : ''
  return request('m1', `${ADMIN}/boats${qs}`).then((data) => data.boats.map(mapListItem))
}

export const getVessel = (id, { admin = false } = {}) => request('m1', `${base(admin)}/${id}`).then(mapVessel)

export const listFleetOwners = () => request('m1', `${ADMIN}/owners`).then((data) => data.owners.map(mapOwner))
export const getOwner = (id) => request('m1', `/api/v1/admin/owners/${id}`).then(mapOwner)

// Búsqueda de propietarios por nombre o cédula (el servidor exige 3 caracteres como mínimo).
export const searchOwners = (query) =>
  request('m1', `/api/v1/admin/owners?${new URLSearchParams({ q: query.trim() })}`).then((data) => ({
    owners: data.owners.map(mapOwner),
    hasMore: data.has_more ?? false,
  }))

export const listBoatTypes = () => request('m1', '/api/v1/fleet/boat-types').then((data) =>
  data.types.map((t) => ({ code: t.code, name: t.name, maxCapacity: t.max_capacity })))

const formBody = ({ name, capacity, port, hourlyRate, extras, photo }) => {
  const form = new FormData()
  if (name != null) form.set('name', name)
  if (capacity != null) form.set('max_capacity', String(capacity))
  if (port) {
    form.set('port_name', port.name)
    form.set('latitude', port.lat)
    form.set('longitude', port.long)
  }
  if (hourlyRate != null) form.set('base_rate', String(hourlyRate))
  if (extras) Object.entries(servicesFlags(extras)).forEach(([key, on]) => form.set(key, String(on)))
  if (photo) form.set('photo', photo)
  return form
}

export const updateVessel = (id, changes) => request('m1', `${FLEET}/${id}`, { method: 'PUT', body: formBody(changes) }).then(mapVessel)

export const setMaintenance = (id, { on, reason, start, until, admin = false }) => {
  if (!on) return request('m1', `${base(admin)}/${id}/maintenance/finish`, { method: 'POST' }).then(mapVessel)
  const body = { maintenance_start: start, maintenance_until: until, ...(admin ? { reason } : {}) }
  return request('m1', `${base(admin)}/${id}/maintenance/start`, { method: 'POST', body }).then(mapVessel)
}
export const requestMaintenanceReview = (id) => request('m1', `${FLEET}/${id}/maintenance/request-review`, { method: 'POST' })

export const deleteVessel = (id, { admin = false, reason } = {}) =>
  request('m1', `${base(admin)}/${id}`, { method: 'DELETE', ...(admin ? { body: { reason } } : {}) })

// Registro en dos pasos: borrador (datos básicos) y registro completo (multipart con foto).
export const getDraft = () => request('m1', `${FLEET}/draft`).then(mapDraft).catch((error) => {
  if (error instanceof ApiError && error.status === 404) return null
  throw error
})
export const createDraft = ({ name, plate, type, capacity }) => request('m1', `${FLEET}/draft`, {
  method: 'POST', body: { name, legal_registration: plate, type, max_capacity: capacity },
}).then(mapDraft)
export const deleteDraft = () => request('m1', `${FLEET}/draft`, { method: 'DELETE' })
export const completeRegistration = (id, data) => request('m1', `${FLEET}/${id}/registration`, { method: 'POST', body: formBody(data) }).then(mapVessel)
export const checkPlateAvailable = (value) => request('m1', `${FLEET}/legal-registration-availability?${new URLSearchParams({ value })}`).then((data) => data.available)
