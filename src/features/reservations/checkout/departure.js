export const HARBOR_TIMEZONE = 'America/Bogota'

export function harborDateTime(now = Date.now(), timezone = HARBOR_TIMEZONE) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(now)).map(({ type, value }) => [type, value]))
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` }
}

export function departureError(date, time, timezone = HARBOR_TIMEZONE, now = Date.now()) {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time ?? '')) return 'Ingresa una hora de salida válida.'
  const current = harborDateTime(now, timezone)
  if (date < current.date || (date === current.date && time <= current.time)) {
    return 'La salida debe ser posterior a la hora actual del puerto. Elige otra hora o fecha.'
  }
  return ''
}

export function minimumDepartureTime(date, timezone = HARBOR_TIMEZONE, now = Date.now()) {
  const current = harborDateTime(now, timezone)
  if (date !== current.date) return undefined
  const next = harborDateTime(Math.floor(now / 60000) * 60000 + 60000, timezone)
  return next.date === date ? next.time : '23:59'
}
