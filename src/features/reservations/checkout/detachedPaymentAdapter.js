import { request } from '../../../lib/http'
import { toM3PaymentFields } from './paymentContract.js'

export async function detachedPaymentAdapter(payment, { signal } = {}) {
  if (signal?.aborted) throw new Error('La captura fue cancelada.')
  if (!payment?.formData?.token || !payment.contact?.name || !payment.contact?.phone) {
    throw new Error('La captura local está incompleta.')
  }
  if (!payment.reservationId) throw new Error('Falta el identificador de la reserva.')
  return request('m2', `/api/v1/reservations/${payment.reservationId}/payments`, {
    method: 'POST', signal,
    body: { accepts_cancellation_policy: payment.acceptsCancellationPolicy, payment: toM3PaymentFields(payment) },
  })
}
