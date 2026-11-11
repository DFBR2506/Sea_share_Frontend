const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export const monthName = (m) => MONTHS[m]
export const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
export const isSameDay = (a, b) => !!a && !!b && a.getTime() === b.getTime()
export const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
export const nightsBetween = (a, b) => Math.round((b - a) / 86400000)

/** Días cobrables, incluyendo las fechas de inicio y fin. */
export function inclusiveDays(start, end) {
  const day = (date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return (day(end) - day(start)) / 86400000 + 1
}

// ISO local "YYYY-MM-DD" (para query params)
export const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const fromISO = (s) => {
  if (!s) return null
  const [y, m, d] = s.split('-').map(Number)
  return y && m && d ? new Date(y, m - 1, d) : null
}

export const formatFull = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`

/** "25 – 27 sep" (o "28 ago – 2 sep" si cruza de mes) */
export function formatRange(a, b) {
  if (a.getMonth() === b.getMonth()) return `${a.getDate()} – ${b.getDate()} ${SHORT[b.getMonth()]}`
  return `${a.getDate()} ${SHORT[a.getMonth()]} – ${b.getDate()} ${SHORT[b.getMonth()]}`
}

export const money = (n) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
export const moneyInt = (n) => `$${n.toLocaleString('en-US')}`
export const copMoney = (n) => `$ ${n.toLocaleString('es-CO')} COP`
export const copPlain = (n) => `$ ${n.toLocaleString('en-US')}`
export const millions = (n) => `$ ${n.toFixed(2)} M`
