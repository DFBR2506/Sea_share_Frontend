import { useContext } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CheckoutContext } from '../checkout/checkoutContext'
import { isPaymentConfigurationError, paymentOutcomeMessage } from '../checkout/paymentOutcome'
import { Button } from '@/components/ui'
import { copDecimal } from '@/lib/dates'
import { isUUID } from '@/lib/uuid'
import { m3ErrorMessage } from '@/features/finance/errors'
import { usePaymentConfirmation } from '@/features/finance/hooks'
import styles from '../pages/pages.module.css'

// Estados del contrato UC06; IN_PROCESS y UNKNOWN son transitorios del procesamiento asíncrono.
const STATUS_LABEL = {
  IN_PROCESS: 'En proceso',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
  CANCELLED: 'Cancelado',
  EXPIRED: 'Vencido',
  UNKNOWN: 'Desconocido',
}
const AMOUNTS = [
  ['Autorizado', 'authorized'],
  ['Capturado', 'captured'],
  ['Liberado (reembolsos)', 'released'],
  ['Cobrado', 'charged'],
]

/**
 * UC06 · confirmación financiera de una reserva registrada en M3 por M2 (parámetro
 * `reservationId`). Es un panel informativo separado del Brick: la tokenización sigue
 * siendo local y desacoplada hasta que exista la integración con M2.
 */
export default function PaymentConfirmationPanel({ reservationId: explicitReservationId }) {
  const [params] = useSearchParams()
  const checkout = useContext(CheckoutContext)
  const reservationId = explicitReservationId ?? checkout?.reservationId ?? params.get('reservationId')?.trim() ?? ''

  if (!reservationId) return null
  if (!isUUID(reservationId)) {
    return (
      <section className={styles.panel} style={{ marginTop: 16 }}>
        <h2>Confirmación financiera (M3)</h2>
        <p className={styles.muted}>El parámetro reservationId de la URL no es un UUID válido; no se consulta M3.</p>
      </section>
    )
  }
  if (checkout && !checkout.paymentStarted) return null
  return <Confirmation reservationId={reservationId} poll={Boolean(checkout?.paymentStarted)} />
}

function Confirmation({ reservationId, poll }) {
  const { data, isPending, isFetching, isError, error, refetch } = usePaymentConfirmation(reservationId, { poll })
  const asyncPending = data && (data.status === 'IN_PROCESS' || data.status === 'UNKNOWN')
  const configurationError = isPaymentConfigurationError(data?.detail)
  const detail = data ? paymentOutcomeMessage(data.status, data.detail) : null

  return (
    <section className={styles.panel} style={{ marginTop: 16 }}>
      <h2>Confirmación financiera (M3 · UC06)</h2>
      {isPending && <p className={styles.muted}>Consultando la confirmación de la reserva {reservationId}…</p>}
      {isError && (
        <p className={styles.muted} role={error?.code === 'CHARGE_INTENT_NOT_FOUND' ? 'status' : 'alert'}>
          {error?.code === 'CHARGE_INTENT_NOT_FOUND' ? 'No hay un intento de cobro registrado para esta reserva.' : m3ErrorMessage(error)}
        </p>
      )}
      {data && (
        <>
          <div className={styles.lines}>
            <div className={styles.line}><span>Estado del cobro</span><span>{configurationError ? 'Error de configuración del servicio' : STATUS_LABEL[data.status] ?? data.status}</span></div>
            {detail && <div className={styles.line}><span>Detalle</span><span>{detail}</span></div>}
            {AMOUNTS.filter(([, key]) => data[key] != null).map(([label, key]) => (
              <div key={key} className={styles.line}><span>{label}</span><span>{copDecimal(data[key])}</span></div>
            ))}
            <div className={styles.line}><span>Referencia externa</span><span>{data.externalRef ?? '—'}</span></div>
          </div>
          {asyncPending && !configurationError && (
            <p className={styles.payNote}>La pasarela procesa el cobro de forma asíncrona: usa «Actualizar estado» en unos segundos.</p>
          )}
          <Button variant="outline" square onClick={() => refetch()} disabled={isFetching}>Actualizar estado</Button>
        </>
      )}
    </section>
  )
}
