import { useEffect, useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useCheckout } from '../checkout/checkoutContext'
import { loadMercadoPagoSdk } from '../checkout/mercadoPagoSdk'
import { mountPaymentBrick } from '../checkout/paymentBrickLifecycle'
import { paymentBrickSettings } from '../checkout/paymentBrickSettings'
import { createPaymentFlow } from '../checkout/paymentFlow'
import { brickVariables } from '../checkout/brickAppearance'
import { getReservationStatusUI } from '../api/statusMap'
import styles from '../pages/pages.module.css'

function BrickInstance({ publicKey, contact, onBusyChange }) {
  const navigate = useNavigate()
  const target = `payment-brick-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const { quotation, expiresAt, checkoutId, reservationId, accepted, expired } = useCheckout()
  const developmentPayment = import.meta.env.DEV && !publicKey
  const flowRef = useRef(null)
  const [view, setView] = useState({ status: 'loading_sdk', message: '', evidence: null })
  const { status, message, reservationStatus } = view
  const reservationUI = reservationStatus ? getReservationStatusUI(reservationStatus) : null

  useEffect(() => {
    let session
    const flow = createPaymentFlow({
      checkoutId, reservationId, acceptsCancellationPolicy: accepted, contact, amount: quotation.total_amount, expiresAt,
      onChange: (next) => { setView(next); onBusyChange(next.status === 'tokenizing' || next.status === 'tokenized') },
    })
    flowRef.current = flow
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
      if (developmentPayment) {
        flow.ready()
      } else {
        session = mountPaymentBrick({
          loadSdk: loadMercadoPagoSdk, publicKey, target,
          settings: paymentBrickSettings(quotation.total_amount, callbacks, brickVariables()),
        })
        session.ready.catch(() => flow.fail('No se pudo cargar el formulario de MercadoPago. Comprueba la conexión y la Public Key de pruebas.'))
      }
    } catch {
      flow.fail('No se pudo inicializar el formulario de MercadoPago.')
    }

    return () => {
      clearTimeout(expiryTimer)
      flowRef.current = null
      flow.dispose()
      onBusyChange(false)
      // Capturar errores de limpieza sin registrar datos del SDK.
      session?.dispose().catch(() => {})
    }
  }, [publicKey, target, quotation.total_amount, expiresAt, checkoutId, reservationId, accepted, contact, onBusyChange, developmentPayment])

  useEffect(() => {
    if (status === 'tokenized' && reservationStatus === 'CONFIRMADA' && !message) {
      navigate(`/mis-reservas/${reservationId}`, { replace: true })
    }
  }, [status, reservationStatus, message, reservationId, navigate])

  const submitDevelopmentPayment = () => {
    if (!developmentPayment || expired || !accepted || !reservationId || !flowRef.current) return
    return flowRef.current.submit({
      selectedPaymentMethod: 'credit_card',
      formData: {
        token: 'token-test',
        payment_method_id: 'visa',
        installments: 1,
        transaction_amount: quotation.total_amount,
        payer: { email: 'payer@example.com' },
      },
    }, { lastFourDigits: '4242' }).catch((error) => {
      setView((current) => ({ ...current, message: error.message }))
    })
  }

  return (
    <>
      {!developmentPayment && <p className={styles.payNote}>Usa únicamente tarjetas y datos de prueba de Colombia.</p>}
      {status === 'loading_sdk' && !developmentPayment && <p className={styles.state} role="status">Cargando formulario seguro…</p>}
      {developmentPayment && <Button disabled={expired || !accepted || !reservationId || !['ready', 'error'].includes(status)} onClick={submitDevelopmentPayment}>Pago de prueba (solo desarrollo)</Button>}
      {status === 'tokenizing' && <p className={styles.payNote} role="status">Consultando el pago y el estado de la reserva… No cierres este paso.</p>}
      {status === 'error' && <p className={styles.payNote} role="alert">{message}</p>}
      {status === 'expired' && <p className={styles.payNote} role="alert">{message}</p>}
      {!developmentPayment && <div id={target} hidden={status === 'tokenized' || status === 'expired'} aria-busy={status === 'loading_sdk' || status === 'tokenizing'} />}
      {status === 'tokenized' && <div role="status">
        {message && <p role="alert">{message}</p>}
      </div>}
      {reservationUI && <p role="status">{reservationUI.label}</p>}
    </>
  )
}

export default function PaymentBrick({ contact }) {
  const { expired, checkoutId } = useCheckout()
  const [attempt, setAttempt] = useState(0)
  const [busy, setBusy] = useState(false)
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY?.trim()

  if (expired && !busy) return null
  if (!publicKey) return <>
    <p className={styles.payNote} role="alert" data-payment-state="configuration_error">Falta configurar VITE_MERCADOPAGO_PUBLIC_KEY con la Public Key de pruebas de una aplicación de Colombia.</p>
    {import.meta.env.DEV && <BrickInstance key={checkoutId} publicKey={publicKey} contact={contact} onBusyChange={setBusy} />}
  </>

  return (
    <>
      <BrickInstance key={`${checkoutId}-${attempt}`} publicKey={publicKey} contact={contact} onBusyChange={setBusy} />
      <Button variant="secondary" disabled={busy} onClick={() => setAttempt((current) => current + 1)}>Volver a cargar formulario</Button>
      <p className={styles.payNote}>Volver a cargar borra los datos ingresados y el token de esta prueba; no reinicia el tiempo disponible.</p>
    </>
  )
}
