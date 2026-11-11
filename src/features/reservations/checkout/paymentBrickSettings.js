export function paymentBrickSettings(amount, callbacks, customVariables = {}) {
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('El importe de prueba no es válido.')
  return {
    initialization: { amount },
    customization: {
      paymentMethods: {
        creditCard: 'all', debitCard: 'all', minInstallments: 1, maxInstallments: 1,
      },
      visual: {
        style: { theme: 'default', customVariables },
        texts: {
          formTitle: 'Datos del pagador y tarjeta',
          email: { label: 'Correo del pagador' },
          cardholderName: { label: 'Nombre del titular de la tarjeta' },
          formSubmit: 'Obtener datos de pago de prueba',
        },
      },
    },
    callbacks,
  }
}

// Evidencia sin token, correo, documento, BIN ni nombre del titular.
export function tokenizationEvidence({ selectedPaymentMethod, formData }, additionalData) {
  return {
    tokenPresent: typeof formData?.token === 'string' && formData.token.trim().length > 0,
    selectedPaymentMethod,
    paymentMethodId: formData?.payment_method_id,
    installments: formData?.installments,
    emailPresent: typeof formData?.payer?.email === 'string' && formData.payer.email.trim().length > 0,
    issuerPresent: formData?.issuer_id != null && String(formData.issuer_id).trim().length > 0,
    identificationPresent: Boolean(formData?.payer?.identification?.type && formData?.payer?.identification?.number),
    lastFourPresent: /^\d{4}$/.test(additionalData?.lastFourDigits ?? ''),
    paymentCreated: false,
  }
}

export function validateTokenizedCard(result, amount) {
  const data = result?.formData
  if (!['credit_card', 'debit_card'].includes(result?.selectedPaymentMethod)
    || typeof data?.token !== 'string' || !data.token.trim()
    || typeof data.payment_method_id !== 'string' || !data.payment_method_id.trim()
    || typeof data.payer?.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.payer.email)
    || data.installments !== 1 || !Number.isFinite(data.transaction_amount)
    || data.transaction_amount <= 0 || data.transaction_amount !== amount) {
    throw new Error('El formulario no devolvió los datos de tarjeta esperados. Revisa los campos e inténtalo de nuevo.')
  }
}
