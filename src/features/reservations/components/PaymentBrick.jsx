import { useEffect, useId, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { copDecimal } from '@/lib/dates'
import { useCheckout } from '../checkout/checkoutContext'
import { loadMercadoPagoSdk } from '../checkout/mercadoPagoSdk'
import { mountPaymentBrick } from '../checkout/paymentBrickLifecycle'
import { paymentBrickSettings } from '../checkout/paymentBrickSettings'
import { createPaymentFlow } from '../checkout/paymentFlow'
import { brickVariables } from '../checkout/brickAppearance'
import { getReservationStatusUI } from '../api/statusMap'
import { usePaymentConfirmation, useReservationValue } from '@/features/finance/hooks'
import { isPaymentConfigurationError } from '../checkout/paymentOutcome'
import styles from '../pages/pages.module.css'

function BrickInstance({ publicKey, contact, amount, onPhaseChange }) {
  const navigate = useNavigate()
  const target = `payment-brick-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const { expiresAt, checkoutId, reservationId, accepted, beginPayment } = useCheckout()
  const [view, setView] = useState({ status: 'loading_sdk', message: '', evidence: null })
  const { status, message, reservationStatus } = view
  const reservationUI = reservationStatus ? getReservationStatusUI(reservationStatus) : null

  useEffect(() => {
    let session
    const flow = createPaymentFlow({
      checkoutId, reservationId, acceptsCancellationPolicy: accepted, contact, amount, expiresAt,
      beforePayment: beginPayment,
      onChange: (next) => { setView(next); onPhaseChange(next.status) },
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
        settings: paymentBrickSettings(amount, callbacks, brickVariables()),
      })
      session.ready.catch(() => flow.fail('No se pudo cargar el formulario de MercadoPago. Comprueba la conexión y la Public Key de pruebas.'))
    } catch {
      flow.fail('No se pudo inicializar el formulario de MercadoPago.')
    }

    return () => {
      clearTimeout(expiryTimer)
      flow.dispose()
      onPhaseChange('idle')
      // Capturar errores de limpieza sin registrar datos del SDK.
      session?.dispose().catch(() => {})
    }
  }, [publicKey, target, amount, expiresAt, checkoutId, reservationId, accepted, contact, onPhaseChange, beginPayment])

  useEffect(() => {
    if (status === 'tokenized' && reservationStatus === 'CONFIRMADA' && !message) {
      navigate(`/mis-reservas/${reservationId}`, { replace: true })
    }
  }, [status, reservationStatus, message, reservationId, navigate])

  return (
    <>
      <p className={styles.payNote}>Usa únicamente tarjetas y datos de prueba de Colombia.</p>
      {status === 'loading_sdk' && <p className={styles.state} role="status">Cargando formulario seguro…</p>}
      {status === 'tokenizing' && <p className={styles.payNote} role="status">Consultando el pago y el estado de la reserva… No cierres este paso.</p>}
      {status === 'error' && <p className={styles.payNote} role="alert">{message}</p>}
      {status === 'expired' && <p className={styles.payNote} role="alert">{message}</p>}
      <div id={target} hidden={status === 'tokenized' || status === 'expired'} aria-busy={status === 'loading_sdk' || status === 'tokenizing'} />
      {status === 'tokenized' && <div>
        {message && <p role="alert">{message}</p>}
        {reservationStatus !== 'CONFIRMADA' && !message && <>
          <p className={styles.payNote} role="status">Tu pago fue enviado, pero la reserva aún no aparece confirmada. Revísala en Mis reservas en unos minutos.</p>
          <Button type="button" onClick={() => navigate('/mis-reservas')}>Ir a Mis reservas</Button>
        </>}
      </div>}
      {reservationUI && <p role="status">{reservationUI.label}</p>}
    </>
  )
}

export default function PaymentBrick({ contact }) {
  const { expired, checkoutId, reservationId, paymentStarted } = useCheckout()
  const [attempt, setAttempt] = useState(0)
  const [phase, setPhase] = useState('idle')
  const busy = phase === 'tokenizing' || phase === 'tokenized'
  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY?.trim()
  const confirmation = usePaymentConfirmation(reservationId, { enabled: paymentStarted, poll: paymentStarted })
  const value = useReservationValue(reservationId)
  const retryRejected = !expired && phase === 'tokenized' && confirmation.data?.status === 'REJECTED' && !isPaymentConfigurationError(confirmation.data.detail)

  if (expired && !busy) return null
  if (!publicKey) return <p className={styles.payNote} role="alert" data-payment-state="configuration_error">Falta configurar VITE_MERCADOPAGO_PUBLIC_KEY con la Public Key de pruebas de una aplicación de Colombia.</p>
  if (value.isPending) return <p role="status">Consultando el importe final con el depósito de garantía…</p>
  if (value.error || !value.data?.total || !(Number(value.data.total) > 0)) return <>
    <p role="alert">No se pudo obtener el importe final del cobro. No se ha enviado ningún pago.</p>
    <Button variant="secondary" onClick={() => value.refetch()}>Consultar importe de nuevo</Button>
  </>

  return (
    <>
      <p className={styles.payNote}>Importe del cobro: <strong>{copDecimal(value.data.total)}</strong>. Incluye alquiler, seguro y depósito de garantía.</p>
      <BrickInstance key={`${checkoutId}-${attempt}`} publicKey={publicKey} contact={contact} amount={Number(value.data.total)} onPhaseChange={setPhase} />
      <Button variant="secondary" disabled={busy && !retryRejected} onClick={() => setAttempt((current) => current + 1)}>{retryRejected ? 'Usar otra tarjeta' : 'Volver a cargar formulario'}</Button>
      <p className={styles.payNote}>Volver a cargar borra los datos ingresados y el token de esta prueba; no reinicia el tiempo disponible.</p>
    </>
  )
}
