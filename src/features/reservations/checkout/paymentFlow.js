import { detachedPaymentAdapter } from './detachedPaymentAdapter.js'
import { normalizePayment } from './paymentContract.js'
import { getReservation } from '../api'

// El contrato sensible vive en este cierre, nunca en React Query ni en storage.
export function createPaymentFlow({ checkoutId, reservationId, acceptsCancellationPolicy, contact, amount, expiresAt,
  adapter = detachedPaymentAdapter, now = Date.now, onChange = () => {} }) {
  let view = { status: 'loading_sdk', message: '', evidence: null }
  let captured = null
  let pending = null
  let disposed = false
  let abort
  let paymentStarted = false
  let paymentAccepted = false
  let reservationStatus = null

  const publish = (status, message = '', evidence = null) => {
    view = { status, message, evidence, reservationStatus }
    if (!disposed) onChange(view)
  }
  const expire = () => {
    if (paymentStarted) return
    captured = null
    abort?.abort()
    if (!disposed) publish('expired', 'La ventana del checkout terminó.')
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
      if (disposed || pending || captured || view.status === 'expired') return
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
        let payment = normalizePayment({ checkoutId, reservationId, acceptsCancellationPolicy, contact, result, additionalData, amount, expiresAt }, now())
        try {
          ensureActive()
          paymentStarted = true
          const response = await adapter(payment, { signal })
          paymentAccepted = true
          captured = payment
          for (let attempt = 0; attempt < 6; attempt += 1) {
            await new Promise((resolve, reject) => {
              if (signal.aborted) return reject(new Error('La captura fue cancelada.'))
              const cancel = () => { clearTimeout(timer); reject(new Error('La captura fue cancelada.')) }
              const timer = setTimeout(() => { signal.removeEventListener('abort', cancel); resolve() }, 3000)
              signal.addEventListener('abort', cancel, { once: true })
            })
            if (disposed || signal.aborted) throw new Error('La captura fue cancelada.')
            const reservation = await getReservation(reservationId)
            reservationStatus = reservation.status
            publish('tokenizing')
            if (reservationStatus === 'CONFIRMADA') break
          }
          publish('tokenized')
          return response
        } finally {
          payment = null
        }
      }).catch((error) => {
        if (!paymentAccepted) captured = null
        if (!disposed) publish(paymentAccepted ? 'tokenized' : 'error', error.message)
        throw error
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
