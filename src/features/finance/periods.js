import { monthName } from '@/lib/dates'

// El contrato no ofrece un listado de períodos: se generan en el cliente con el formato canónico de UC13.
// Valor '' = no enviar `period` (el backend usa el último período cerrado).
export const PERIODICITY = [
  { value: 'SEMI_MONTHLY', label: 'Quincenal' },
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'QUARTERLY', label: 'Trimestral' },
]

const pad = (n) => String(n).padStart(2, '0')
const cap = (s) => s[0].toUpperCase() + s.slice(1)

// Cada generador devuelve el período que contiene `now` y retrocede con `step`.
const GENERATORS = {
  SEMI_MONTHLY: (now, i) => {
    const idx = now.getFullYear() * 24 + now.getMonth() * 2 + (now.getDate() > 15 ? 1 : 0) - i
    const y = Math.floor(idx / 24), m = Math.floor((idx % 24) / 2), h = (idx % 2) + 1
    return { value: `${y}-${pad(m + 1)}-H${h}`, label: `${h === 1 ? '1ª' : '2ª'} quincena ${monthName(m).slice(0, 3)} ${y}` }
  },
  MONTHLY: (now, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    return { value: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, label: `${cap(monthName(d.getMonth()))} ${d.getFullYear()}` }
  },
  QUARTERLY: (now, i) => {
    const idx = now.getFullYear() * 4 + Math.floor(now.getMonth() / 3) - i
    const y = Math.floor(idx / 4), q = (idx % 4) + 1
    return { value: `${y}-Q${q}`, label: `${q}T ${y}` }
  },
}

export function listPeriods(periodicity, now = new Date(), count = 6) {
  const periods = Array.from({ length: count }, (_, i) => {
    const p = GENERATORS[periodicity](now, i)
    return i === 0 ? { ...p, label: `${p.label} (en curso)` } : p
  })
  return [{ value: '', label: 'Último período cerrado' }, ...periods]
}
