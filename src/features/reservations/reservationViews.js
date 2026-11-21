const CANCELLED_STATUSES = new Set(['CANCELADA', 'EXPIRADA', 'PAGO_FALLIDO'])

export function reservationView(reservations, tab) {
  return reservations.filter(({ status }) => status !== 'INICIADA'
    && (tab === 'canceladas' ? CANCELLED_STATUSES.has(status) : !CANCELLED_STATUSES.has(status)))
}
