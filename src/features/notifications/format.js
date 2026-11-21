// Textos de las notificaciones de M1: el servidor manda una frase ya redactada y aquí se separa
// en título, resumen y motivo para presentarla con el estilo de la aplicación.

export const TYPE_INFO = {
  VESSEL_DELETED: { title: 'Embarcación eliminada', tone: 'danger', icon: 'trash' },
  MAINTENANCE_NOTICE: { title: 'Mantenimiento', tone: 'warning', icon: 'wrench' },
  REVIEW_REQUEST: { title: 'Solicitud de revisión', tone: 'brand', icon: 'check' },
  VESSEL_AVAILABLE: { title: 'Embarcación disponible', tone: 'success', icon: 'check' },
}
export const FALLBACK_INFO = { title: 'Notificación', tone: 'brand', icon: 'bell' }
export const infoFor = (type) => TYPE_INFO[type] ?? FALLBACK_INFO

export const SUMMARIES = {
  MAINTENANCE_NOTICE: 'El administrador ha enviado un aviso sobre el estado de la embarcación.',
  REVIEW_REQUEST: 'El propietario ha solicitado la revisión de la embarcación.',
}

const DATE_FORMAT = new Intl.DateTimeFormat('es-CO', {
  day: 'numeric', month: 'long', year: 'numeric', hour: 'numeric', minute: '2-digit',
  timeZone: 'America/Bogota',
})

/** Nombre y matrícula citados en el mensaje: «Tu embarcación X (CP-…) …». */
export function parseVessel(message) {
  const match = /embarcación (.+?) \(([^)]+)\)/.exec(message ?? '')
  return match ? { name: match[1], plate: match[2] } : { name: null, plate: null }
}

/** Separa "… Motivo: texto" en el mensaje y el motivo, para mostrarlo destacado. */
export function splitReason(message) {
  const match = /^([\s\S]*?)\s*Motivo:\s*([\s\S]+)$/.exec(message ?? '')
  return match ? { text: match[1], reason: match[2] } : { text: message ?? '', reason: null }
}

/** "3 de noviembre de 2026, 9:15 p. m." en hora de Colombia. */
export function formatDate(iso) {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? '' : DATE_FORMAT.format(date)
}

/** "Hace 5 min", "Hace 2 h", "Ayer"; pasados dos días, la fecha completa. */
export function timeAgo(iso, now = Date.now()) {
  const time = new Date(iso).getTime()
  if (Number.isNaN(time)) return ''
  const minutes = Math.floor((now - time) / 60000)
  if (minutes < 1) return 'Ahora mismo'
  if (minutes < 60) return `Hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `Hace ${hours} h`
  if (hours < 48) return 'Ayer'
  return formatDate(iso)
}
