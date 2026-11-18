const STATUS_MAP = {
  RESERVED: 'CONFIRMADA',
  PENDING_PAYMENT: 'PENDIENTE_PAGO',
  IN_NAVIGATION: 'EN_NAVEGACION',
  COMPLETED: 'COMPLETADA',
  CANCELLED: 'CANCELADA',
  INITIATED: 'INICIADA',
  EXPIRED: 'EXPIRADA',
  PAYMENT_FAILED: 'PAGO_FALLIDO',
}

export const RESERVATION_STATUS_UI = {
  CONFIRMADA: { label: 'Confirmada', tone: 'confirmed' },
  EN_NAVEGACION: { label: 'En navegación', tone: 'ongoing' },
  PENDIENTE_PAGO: { label: 'Pendiente de pago', tone: 'pending' },
  COMPLETADA: { label: 'Completada', tone: 'completed' },
  CANCELADA: { label: 'Cancelada', tone: 'canceled' },
  INICIADA: { label: 'Iniciada', tone: 'neutral' },
  EXPIRADA: { label: 'Expirada', tone: 'neutral' },
  PAGO_FALLIDO: { label: 'Pago fallido', tone: 'neutral' },
}

export function mapReservationStatus(status) {
  return Object.hasOwn(STATUS_MAP, status) ? STATUS_MAP[status] : status
}

export function getReservationStatusUI(status) {
  const mapped = mapReservationStatus(status)
  return Object.hasOwn(RESERVATION_STATUS_UI, mapped)
    ? RESERVATION_STATUS_UI[mapped]
    : { tone: 'neutral', label: status }
}
