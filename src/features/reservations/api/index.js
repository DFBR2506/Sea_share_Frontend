import { BOATS, RESERVATIONS } from './mocks'

// Capa de acceso a datos del módulo 2. Hoy devuelve mocks; al llegar los contratos
// solo se cambia el cuerpo de estas funciones por `request('m2', ...)`.
const delay = (value, ms = 250) => new Promise((resolve) => setTimeout(() => resolve(value), ms))

export const listBoats = () => delay(BOATS)

export const getBoat = (id) => delay(BOATS.find((b) => b.id === id) ?? null)

export const listReservations = () => delay(RESERVATIONS)

export const getReservation = (id) => delay(RESERVATIONS.find((r) => r.id === id) ?? null)

export const priceBreakdown = (pricePerDay, nights) => {
  const base = pricePerDay * nights
  const commission = Math.round(base * 0.2)
  const insurance = 40
  const deposit = 200
  return { base, commission, insurance, deposit, total: base + commission + insurance + deposit }
}
