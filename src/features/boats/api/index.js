import { CURRENT_OWNER_ID, OWNERS, VESSELS } from './mocks'

// Capa de acceso del módulo 1. Mantiene un store en memoria para que las acciones
// (editar, mantenimiento, eliminar, registrar) se vean en la UI. Al llegar los contratos
// se reemplaza por `request('m1', ...)`.
let vessels = VESSELS.map((v) => ({ ...v }))
const delay = (value, ms = 200) => new Promise((resolve) => setTimeout(() => resolve(structuredClone(value)), ms))

export const listOwnerVessels = () => delay(vessels.filter((v) => v.ownerId === CURRENT_OWNER_ID))
export const listAllVessels = () => delay(vessels.map((v) => ({ ...v, owner: OWNERS.find((o) => o.id === v.ownerId) })))
export const getVessel = (id) => delay(vessels.find((v) => v.id === id) ?? null)
export const listOwners = () => delay(OWNERS)
export const getOwner = (id) => delay(OWNERS.find((o) => o.id === id) ?? null)

const patch = (id, changes) => {
  vessels = vessels.map((v) => (v.id === id ? { ...v, ...changes } : v))
  return delay(vessels.find((v) => v.id === id))
}

export const updateVessel = (id, changes) => patch(id, changes)
export const setMaintenance = (id, on, reason) => patch(id, { status: on ? 'MANTENIMIENTO' : 'DISPONIBLE', maintenanceReason: on ? reason : undefined })
export const deleteVessel = (id) => {
  vessels = vessels.filter((v) => v.id !== id)
  return delay(true)
}
export const createVessel = (data) => {
  const vessel = { id: `v${Date.now()}`, ownerId: CURRENT_OWNER_ID, isNew: true, status: 'DISPONIBLE', ...data }
  vessels = [...vessels, vessel]
  return delay(vessel)
}
