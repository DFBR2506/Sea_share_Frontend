import { fromISO, toISO } from '../../../lib/dates.js'
import { harborDateTime, HARBOR_TIMEZONE } from './departure.js'

// Valida el contexto compartido por el resumen y el siguiente paso del pago.
export function readPaymentSelection(params, maxPassengers, { now = Date.now(), timezone = HARBOR_TIMEZONE } = {}) {
  const startValue = params.get('start')
  const endValue = params.get('end')
  const start = fromISO(startValue)
  const end = fromISO(endValue)
  const pax = Number(params.get('pax'))

  const validDate = (value, date) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? '')
    && date && Number.isFinite(date.getTime()) && toISO(date) === value

  if (!Number.isInteger(maxPassengers) || maxPassengers < 1
    || !validDate(startValue, start) || !validDate(endValue, end) || end < start
    || startValue < harborDateTime(now, timezone).date
    || !Number.isInteger(pax) || pax < 1 || pax > maxPassengers) return null

  return { start, end, pax }
}
