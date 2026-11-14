import { useEffect, useId, useState } from 'react'
import { Button } from '@/components/ui'
import { useCheckout } from '../checkout/checkoutContext'
import { loadMercadoPagoSdk } from '../checkout/mercadoPagoSdk'
import { mountPaymentBrick } from '../checkout/paymentBrickLifecycle'
import { paymentBrickSettings } from '../checkout/paymentBrickSettings'
import { createPaymentFlow } from '../checkout/paymentFlow'
import { brickVariables } from '../checkout/brickAppearance'
import styles from '../pages/pages.module.css'

function BrickInstance({ publicKey, contact, onBusyChange }) {
  const target = `payment-brick-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const { price, expiresAt, checkoutId } = useCheckout()
  const [view, setView] = useState({ status: 'loading_sdk', message: '', evidence: null })
  const { status, message, evidence } = view

  useEffect(() => {
    let session
    const flow = createPaymentFlow({
      checkoutId, contact, amount: Number(price.total), expiresAt,
      onChange: (next) => { setView(next); onBusyChange(next.status === 'tokenizing') },
    })
    const callbacks = {
      onReady: flow.ready,
      onError: () => flow.fail('MercadoPago no pudo completar el formulario. Revisa los datos o vuelve a cargarlo.'),
      onSubmit: flow.submit,
    }

    // Además del contador de la página, cancelar el cierre sensible al vencer.
    const expiryTimer = setTimeout(() => {
      flow.expire()
      session?.dispose().catch(() => {})
    }, Math.max(0, expiresAt - Date.now()))

    try {
      session = mountPaymentBrick({
        loadSdk: loadMercadoPagoSdk, publicKey, target,
        settings: paymentBrickSettings(Number(price.total), callbacks, brickVariables()),
      })
      session.ready.catch(() => flow.fail('No se pudo cargar el formulario de MercadoPago. Comprueba la conexión y la Public Key de pruebas.'))
    } catch {
      flow.fail('No se pudo inicializar el formulario de MercadoPago.')
    }

    return () => {
      clearTimeout(expiryTimer)
      flow.dispose()
      onBusyChange(false)
      // Capturar errores de limpieza sin registrar datos del SDK.
      session?.dispose().catch(() => {})
    }
  }, [publicKey, target, price.total, expiresAt, checkoutId, contact, onBusyChange])

  return (
    <>
      <p className={styles.payNote}>Usa únicamente tarjetas y datos de prueba de Colombia. Este formulario obtiene un token; no realiza ningún cobro.</p>
      {status === 'loading_sdk' && <p className={styles.state} role="status">Cargando formulario seguro…</p>}
      {status === 'tokenizing' && <p className={styles.payNote} role="status">Validando y capturando los datos de prueba… No cierres este paso.</p>}
      {status === 'error' && <p className={styles.payNote} role="alert">{message}</p>}
      {status === 'expired' && <p className={styles.payNote} role="alert">{message}</p>}
      <div id={target} hidden={status === 'tokenized' || status === 'expired'} aria-busy={status === 'loading_sdk' || status === 'tokenizing'} />
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
  const [busy, setBusy] = useState(false)
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY?.trim()

  if (expired) return null
  if (!publicKey) return <p className={styles.payNote} role="alert" data-payment-state="configuration_error">Falta configurar VITE_MERCADOPAGO_PUBLIC_KEY con la Public Key de pruebas de una aplicación de Colombia. No se cargó el formulario ni se realizó ningún cobro.</p>

  return (
    <>
      <BrickInstance key={`${checkoutId}-${attempt}`} publicKey={publicKey} contact={contact} onBusyChange={setBusy} />
      <Button variant="secondary" disabled={busy} onClick={() => setAttempt((current) => current + 1)}>Volver a cargar formulario</Button>
      <p className={styles.payNote}>Volver a cargar borra los datos ingresados y el token de esta prueba; no reinicia el tiempo disponible.</p>
    </>
  )
}
