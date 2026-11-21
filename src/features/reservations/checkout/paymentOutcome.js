export function isPaymentConfigurationError(detail) {
  return /gateway_configuration_error|invalid credentials/i.test(detail ?? '')
}

const REASONS = {
  cc_rejected_insufficient_amount: 'La tarjeta no tiene fondos suficientes.',
  cc_rejected_bad_filled_card_number: 'Revisa el número de la tarjeta.',
  cc_rejected_bad_filled_date: 'Revisa la fecha de vencimiento de la tarjeta.',
  cc_rejected_bad_filled_security_code: 'Revisa el código de seguridad de la tarjeta.',
  cc_rejected_bad_filled_other: 'Revisa los datos de la tarjeta.',
  cc_rejected_call_for_authorize: 'Tu banco requiere que autorices este pago.',
  cc_rejected_card_disabled: 'La tarjeta está deshabilitada para este pago.',
  cc_rejected_high_risk: 'Mercado Pago rechazó el pago por su evaluación de seguridad.',
  cc_rejected_duplicated_payment: 'Mercado Pago detectó un posible pago duplicado. Consulta su estado antes de intentar otro.',
  accredited: 'El pago fue aprobado.',
}

export function paymentOutcomeMessage(status, detail) {
  if (isPaymentConfigurationError(detail)) return 'El servidor no pudo autenticarse con Mercado Pago. No es un rechazo de tu tarjeta. No intentes otro pago hasta que se corrija la configuración del servicio.'
  if (REASONS[detail]) return REASONS[detail]
  if (status === 'REJECTED') return 'Mercado Pago rechazó este intento. No se ha confirmado el cobro.'
  if (status === 'UNKNOWN') return 'El resultado del pago no está confirmado. Consulta su estado antes de intentar otro pago.'
  return null
}
