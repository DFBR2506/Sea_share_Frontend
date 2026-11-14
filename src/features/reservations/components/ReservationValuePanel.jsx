import { useSearchParams } from 'react-router-dom'
import { copDecimal } from '@/lib/dates'
import { isUUID } from '@/lib/uuid'
import { m3ErrorMessage } from '@/features/finance/errors'
import { useReservationValue } from '@/features/finance/hooks'
import styles from '../pages/pages.module.css'

/**
 * UC04 · desglose que M3 registró para una reserva informada por M2 (parámetro
 * `reservationId` en la URL del checkout). La tokenización del Brick y este desglose son
 * independientes: aquí solo se muestra lo que el backend calculó y dejó listo para el cobro.
 */
export default function ReservationValuePanel() {
  const [params] = useSearchParams()
  const reservationId = params.get('reservationId')?.trim() ?? ''

  if (!reservationId) return null
  if (!isUUID(reservationId)) {
    return (
      <section className={styles.panel} style={{ marginTop: 16 }}>
        <h2>Desglose registrado (M3)</h2>
        <p className={styles.muted}>El parámetro reservationId de la URL no es un UUID válido; no se consulta M3.</p>
      </section>
    )
  }
  return <ReservationValue reservationId={reservationId} />
}

function ReservationValue({ reservationId }) {
  const { data, isPending, isError, error } = useReservationValue(reservationId)

  return (
    <section className={styles.panel} style={{ marginTop: 16 }}>
      <h2>Desglose registrado (M3 · UC04)</h2>
      {isPending && <p className={styles.muted}>Consultando el desglose de la reserva {reservationId}…</p>}
      {isError && <p className={styles.muted} role="alert">No se pudo obtener el desglose: {m3ErrorMessage(error)}</p>}
      {data && (
        <>
          <div className={styles.lines}>
            <div className={styles.line}><span>Alquiler (tarifa base)</span><span>{copDecimal(data.rental)}</span></div>
            <div className={styles.line}><span>Seguro náutico</span><span>{copDecimal(data.insurance)}</span></div>
            <div className={styles.line}><span>Depósito de garantía</span><span>{copDecimal(data.deposit)}</span></div>
            <div className={`${styles.line} ${styles.total}`}><span>Total registrado</span><span>{copDecimal(data.total)}</span></div>
          </div>
          <p className={styles.payNote}>Calculado y registrado por el backend para la reserva {reservationId}. El resumen local sigue usando valores simulados del prototipo (M2).</p>
        </>
      )}
    </section>
  )
}
