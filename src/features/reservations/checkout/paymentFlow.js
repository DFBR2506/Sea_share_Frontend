import { detachedPaymentAdapter } from './detachedPaymentAdapter.js'
import { normalizePayment, toM3PaymentFields } from './paymentContract.js'
import { tokenizationEvidence } from './paymentBrickSettings.js'

// El contrato sensible vive en este cierre, nunca en React Query ni en storage.
export function createPaymentFlow({ checkoutId, contact, amount, expiresAt,
  adapter = detachedPaymentAdapter, now = Date.now, onChange = () => {} }) {
  let view = { status: 'loading_sdk', message: '', evidence: null }
  let captured = null
  let pending = null
  let disposed = false
  let abort

  const publish = (status, message = '', evidence = null) => {
    view = { status, message, evidence }
    if (!disposed) onChange(view)
  }
  const expire = () => {
    captured = null
    abort?.abort()
    if (!disposed) publish('expired', 'La ventana del checkout terminó. No se realizó ningún cobro.')
  }
  const ensureActive = () => {
    if (disposed) throw new Error('La captura fue cancelada.')
    if (now() >= expiresAt || view.status === 'expired') {
      expire()
      throw new Error('La ventana del checkout terminó.')
    }
  }

  return {
    get snapshot() { return view },
    get hasCapturedPayment() { return captured !== null },
    ready() {
      if (disposed || pending || captured || view.status === 'expired') return
      if (now() >= expiresAt) return expire()
      publish('ready')
    },
    fail(message) {
      if (disposed || pending || view.status === 'expired') return
      captured = null
      if (now() >= expiresAt) return expire()
      publish('error', message)
    },
    submit(result, additionalData) {
      // Reutilizar la misma promesa: un doble callback nunca llama dos veces al adaptador.
      if (pending) return pending
      try {
        ensureActive()
        if (captured) throw new Error('Los datos ya fueron capturados. Recarga el formulario para otra prueba.')
      } catch (error) {
        return Promise.reject(error)
      }
      abort = new AbortController()
      const signal = abort.signal
      pending = Promise.resolve().then(async () => {
        ensureActive()
        let payment = normalizePayment({ checkoutId, contact, result, additionalData, amount, expiresAt }, now())
        try {
          // Revalidar inmediatamente antes y después de la frontera asíncrona.
          ensureActive()
          const response = await adapter(payment, { signal })
          ensureActive()
          if (signal.aborted || response?.mode !== 'detached'
            || response.outcome !== 'tokenized' || response.paymentCreated !== false) {
            throw new Error('Respuesta local inesperada.')
          }
          captured = payment
          const m3Fields = toM3PaymentFields(payment)
          publish('tokenized', '', {
            ...tokenizationEvidence(payment, payment.additionalData),
            contactNamePresent: Boolean(payment.contact.name),
            contactPhonePresent: Boolean(payment.contact.phone),
            m3PaymentFieldsPresent: Boolean(m3Fields.payment_token_ref && m3Fields.payment_metadata.payer_email),
            mode: response.mode,
            outcome: response.outcome,
          })
          return response
        } finally {
          payment = null
        }
      }).catch(() => {
        captured = null
        if (!disposed && (now() >= expiresAt || view.status === 'expired')) expire()
        else if (!disposed) publish('error', 'No se pudieron capturar los datos. Revisa el formulario e inténtalo de nuevo. No se realizó ningún cobro.')
        // No propagar errores del SDK/adaptador que puedan contener datos personales.
        throw new Error(disposed ? 'La captura fue cancelada.'
          : view.status === 'expired' ? 'La ventana del checkout terminó.' : 'No se pudo completar la captura de prueba.')
      }).finally(() => { pending = null })
      publish('tokenizing')
      return pending
    },
    expire,
    dispose() {
      disposed = true
      captured = null
      abort?.abort()
      // No notificar después de abandonar la página.
    },
  }
}
