// Formatos compartidos por las pantallas de flota (M1). Los mismos en la lista y en la ficha.
import { TYPE_NAMES } from './constants'

export const EMPTY_VALUE = '—'

/** Nombre del tipo de embarcación en español; si llega un código desconocido se muestra tal cual. */
export const typeName = (code) => TYPE_NAMES[code] ?? code ?? EMPTY_VALUE

/** Coordenada con signo y siempre 4 decimales: "10.745" → "10.7450". */
export function formatCoordinate(value) {
  if (value === null || value === undefined || value === '') return EMPTY_VALUE
  const number = Number(value)
  return Number.isFinite(number) ? number.toFixed(4) : EMPTY_VALUE
}

/** Capacidad con su unidad: 12 → "12 pasajeros", 1 → "1 pasajero". */
export function formatCapacity(value) {
  if (value === null || value === undefined || value === '') return EMPTY_VALUE
  const number = Number(value)
  if (!Number.isInteger(number)) return EMPTY_VALUE
  return number === 1 ? '1 pasajero' : `${number} pasajeros`
}

/** Teléfono colombiano de 10 dígitos como "+57 310 456 7890"; otro formato se deja como llegó. */
export function formatPhone(phone) {
  const digits = String(phone ?? '').replace(/\D/g, '')
  if (digits.length !== 10) return phone || EMPTY_VALUE
  return `+57 ${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

/** Iniciales del avatar: primera letra de la primera y de la última palabra. */
export function ownerInitials(fullName) {
  const words = String(fullName ?? '').split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  const first = words[0][0]
  return (words.length === 1 ? first : first + words[words.length - 1][0]).toUpperCase()
}
