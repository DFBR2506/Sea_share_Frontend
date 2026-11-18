import { validateTokenizedCard } from './paymentBrickSettings.js'

export function contactErrors(contact) {
  return {
    name: typeof contact?.name !== 'string' || !contact.name.trim() ? 'Ingresa el nombre completo del contacto.' : '',
    phone: typeof contact?.phone !== 'string' || !contact.phone.trim() ? 'Ingresa el teléfono de contacto.' : '',
  }
}

export function normalizePayment({ checkoutId, reservationId, acceptsCancellationPolicy, contact, result, additionalData, amount, expiresAt }, now = Date.now()) {
  if (!checkoutId || now >= expiresAt || !Number.isFinite(expiresAt)) {
    throw new Error('El checkout no está vigente.')
  }
  if (Object.values(contactErrors(contact)).some(Boolean)) throw new Error('Completa los datos de contacto.')
  validateTokenizedCard(result, amount)
  const data = result.formData
  const identification = data.payer.identification
  const formData = {
    token: data.token,
    payment_method_id: data.payment_method_id,
    transaction_amount: data.transaction_amount,
    installments: data.installments,
    payer: { email: data.payer.email.trim() },
  }
  if (data.issuer_id != null && String(data.issuer_id).trim()) formData.issuer_id = String(data.issuer_id)
  if (typeof identification?.type === 'string' && identification.type.trim()
    && identification.number != null && String(identification.number).trim()) {
    formData.payer.identification = { type: identification.type, number: String(identification.number) }
  }
  for (const field of ['payment_method_option_id', 'processing_mode']) {
    if (data[field] === null || typeof data[field] === 'string') formData[field] = data[field]
  }
  const extra = {}
  if (/^\d{4}$/.test(additionalData?.lastFourDigits ?? '')) extra.lastFourDigits = additionalData.lastFourDigits
  if (typeof additionalData?.cardholderName === 'string' && additionalData.cardholderName.trim()) {
    extra.cardholderName = additionalData.cardholderName.trim()
  }
  return {
    checkoutId,
    reservationId,
    acceptsCancellationPolicy,
    contact: { name: contact.name.trim(), phone: contact.phone.trim() },
    selectedPaymentMethod: result.selectedPaymentMethod,
    formData,
    additionalData: extra,
  }
}

export function toM3PaymentFields(payment) {
  const metadata = {
    payer_email: payment.formData.payer.email,
    payment_method_id: payment.formData.payment_method_id,
    installments: payment.formData.installments,
  }
  if (payment.additionalData.lastFourDigits) metadata.last_four = payment.additionalData.lastFourDigits
  return {
    payment_token_ref: payment.formData.token,
    payment_method_type: payment.formData.payment_method_id,
    payment_metadata: metadata,
  }
}
