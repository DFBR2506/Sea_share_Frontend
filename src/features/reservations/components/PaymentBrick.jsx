import { useEffect, useId, useRef, useState } from 'react'
import { Button } from '@/components/ui'
import { useCheckout } from '../checkout/checkoutContext'
import { loadMercadoPagoSdk } from '../checkout/mercadoPagoSdk'
import { mountPaymentBrick } from '../checkout/paymentBrickLifecycle'
import { paymentBrickSettings, tokenizationEvidence } from '../checkout/paymentBrickSettings'
import { normalizePayment, toM3PaymentFields } from '../checkout/paymentContract'
import { brickVariables } from '../checkout/brickAppearance'
import styles from '../pages/pages.module.css'

function BrickInstance({ publicKey, contact }) {
  const target = `payment-brick-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const { price, expiresAt, checkoutId } = useCheckout()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')
  const [evidence, setEvidence] = useState(null)
  const captured = useRef(null)

  useEffect(() => {
    let active = true
    let session
    const fail = (text) => {
      captured.current = null
      if (!active) return
      setEvidence(null)
      setMessage(text)
      setStatus('error')
    }
    const callbacks = {
      onReady: () => { if (active) setStatus('ready') },
      onError: () => fail('MercadoPago no pudo completar el formulario. Revisa los datos o vuelve a cargarlo.'),
      onSubmit: async (result, additionalData) => {
        if (!active || Date.now() >= expiresAt) {
          captured.current = null
          throw new Error('La ventana del checkout terminó.')
        }
        try {
          // Solo memoria del componente. No logs, storage, caché ni envíos HTTP.
          const payment = normalizePayment({
            checkoutId, contact, result, additionalData, amount: price.total, expiresAt,
          })
          captured.current = payment
          const m3Fields = toM3PaymentFields(payment)
          setEvidence({
            ...tokenizationEvidence(payment, payment.additionalData),
            contactNamePresent: Boolean(payment.contact.name),
            contactPhonePresent: Boolean(payment.contact.phone),
            m3PaymentFieldsPresent: Boolean(m3Fields.payment_token_ref && m3Fields.payment_metadata.payer_email),
          })
          setStatus('tokenized')
        } catch {
          fail('No se obtuvieron los datos de pago esperados. Revisa los campos e inténtalo de nuevo.')
          throw new Error('No se pudo validar la tokenización de prueba.')
        }
      },
    }

    try {
      session = mountPaymentBrick({
        loadSdk: loadMercadoPagoSdk, publicKey, target,
        settings: paymentBrickSettings(price.total, callbacks, brickVariables()),
      })
      session.ready.catch(() => fail('No se pudo cargar el formulario de MercadoPago. Comprueba la conexión y la Public Key de pruebas.'))
    } catch {
      fail('No se pudo inicializar el formulario de MercadoPago.')
    }

    return () => {
      active = false
      captured.current = null
      // Capturar errores de limpieza sin registrar datos del SDK.
      session?.dispose().catch(() => {})
    }
  }, [publicKey, target, price.total, expiresAt, checkoutId, contact])

  return (
    <>
      <p className={styles.payNote}>Usa únicamente tarjetas y datos de prueba de Colombia. Este formulario obtiene un token; no realiza ningún cobro.</p>
      {status === 'loading' && <p className={styles.state} role="status">Cargando formulario seguro…</p>}
      {status === 'error' && <p className={styles.payNote} role="alert">{message}</p>}
      <div id={target} aria-busy={status === 'loading'} />
      {status === 'tokenized' && <div role="status">
        <p className={styles.payNote}>Datos de pago obtenidos. No se ha realizado ningún cobro.</p>
        <details>
          <summary>Ver comprobación de datos (sin información sensible)</summary>
          <ul className={styles.lines}>
            {Object.entries(evidence).map(([key, value]) => <li key={key}>{key}: {String(value)}</li>)}
          </ul>
        </details>
      </div>}
    </>
  )
}

export default function PaymentBrick({ contact }) {
  const { expired, checkoutId } = useCheckout()
  const [attempt, setAttempt] = useState(0)
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY?.trim()

  if (expired) return null
  if (!publicKey) return <p className={styles.payNote} role="alert">Falta configurar VITE_MERCADOPAGO_PUBLIC_KEY con la Public Key de pruebas de una aplicación de Colombia. No se cargó el formulario ni se realizó ningún cobro.</p>

  return (
    <>
      <BrickInstance key={`${checkoutId}-${attempt}`} publicKey={publicKey} contact={contact} />
      <Button variant="secondary" onClick={() => setAttempt((current) => current + 1)}>Volver a cargar formulario</Button>
      <p className={styles.payNote}>Volver a cargar borra los datos ingresados y el token de esta prueba; no reinicia el tiempo disponible.</p>
    </>
  )
}
