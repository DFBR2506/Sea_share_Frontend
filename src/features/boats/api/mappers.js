import { SERVICES } from '../constants'

// M1 devuelve el estado como nombre de enum (AVAILABLE…); los contratos lo documentan en español.
const STATUS = {
  AVAILABLE: 'DISPONIBLE', DISPONIBLE: 'DISPONIBLE',
  RESERVED: 'RESERVADO', RESERVADO: 'RESERVADO',
  NAVIGATION: 'EN_NAVEGACION', EN_NAVEGACION: 'EN_NAVEGACION',
  MAINTENANCE: 'MANTENIMIENTO', EN_MANTENIMIENTO: 'MANTENIMIENTO', MANTENIMIENTO: 'MANTENIMIENTO',
}
export const toUiStatus = (status) => STATUS[status] ?? status
export const toApiStatus = (status) => ({ DISPONIBLE: 'AVAILABLE', MANTENIMIENTO: 'MAINTENANCE' })[status] ?? status

export const mapOwner = (owner) => owner && ({
  id: owner.owner_id,
  name: owner.full_name,
  document: owner.document_number,
  email: owner.email ?? '',
  phone: owner.phone ?? '',
})

// Fila de listado (propietario o administrador).
export const mapListItem = (boat) => ({
  id: boat.boat_id,
  name: boat.name,
  plate: boat.legal_registration,
  type: boat.type,
  status: toUiStatus(boat.status),
  isNew: boat.is_new ?? false,
  registeredAt: boat.registered_at ?? '',
  owner: mapOwner(boat.owner),
  ownerId: boat.owner?.owner_id,
})

// Detalle completo de una embarcación registrada.
export const mapVessel = (boat) => ({
  id: boat.boat_id,
  name: boat.name,
  plate: boat.legal_registration,
  type: boat.type,
  capacity: boat.max_capacity,
  status: toUiStatus(boat.status),
  maintenanceBy: boat.maintenance_by ?? null,
  reviewRequested: boat.review_requested ?? false,
  photoUrl: boat.photo_url ?? '',
  hourlyRate: boat.base_rate ?? '',
  port: { name: boat.port?.name ?? '', lat: boat.port?.latitude ?? '', long: boat.port?.longitude ?? '' },
  extras: SERVICES.filter((s) => boat.services?.[s.key]).map((s) => s.label),
  registeredAt: boat.registered_at ?? '',
})

export const mapDraft = (draft) => ({
  id: draft.boat_id,
  name: draft.name,
  plate: draft.legal_registration,
  type: draft.type,
  capacity: draft.max_capacity,
})

// Servicios seleccionados (etiquetas) → banderas del contrato.
export const servicesFlags = (extras) => Object.fromEntries(SERVICES.map((s) => [s.key, extras.includes(s.label)]))
