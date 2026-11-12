// Único punto de sustitución para el futuro transporte. Hoy solo confirma la
// recepción local del contrato; no consulta APIs, no persiste ni crea pagos.
export async function detachedPaymentAdapter(payment, { signal } = {}) {
  if (signal?.aborted) throw new Error('La captura fue cancelada.')
  if (!payment?.formData?.token || !payment.contact?.name || !payment.contact?.phone) {
    throw new Error('La captura local está incompleta.')
  }
  return { mode: 'detached', outcome: 'tokenized', paymentCreated: false }
}
