export const DAMAGE_CATEGORIES = [
  { value: '', label: 'Sin categoría' }, { value: 'structure', label: 'Estructura' },
  { value: 'engine', label: 'Motor' }, { value: 'equipment', label: 'Equipamiento' },
  { value: 'cleaning', label: 'Limpieza' }, { value: 'delay', label: 'Retraso' }, { value: 'other', label: 'Otro' },
]

export function canRegisterClaim(dispute, now = Date.now()) {
  return dispute?.status === 'PENDING' && !dispute.claimData
    && now >= Date.parse(dispute.windowStart) && now < Date.parse(dispute.windowEnd)
}

export function evidenceLinks(value) {
  return [...new Set(String(value ?? '').split('\n').map((url) => url.trim()).filter(Boolean))]
}

export function isEvidenceUrl(value) {
  try { return ['https:', 'http:'].includes(new URL(value).protocol) } catch { return false }
}

export function disputeDate(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return 'No disponible'
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short',
  }).format(new Date(value))
}
