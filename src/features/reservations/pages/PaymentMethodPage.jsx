import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui'
import { copDecimal, formatRange } from '@/lib/dates'
import { useCheckout } from '../checkout/checkoutContext'
import CheckoutTimer from '../checkout/CheckoutTimer'
import PaymentDetails from '../components/PaymentDetails'
import PaymentConfirmationPanel from '../components/PaymentConfirmationPanel'
import styles from './pages.module.css'

export default function PaymentMethodPage() {
  const { boatId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { boat, selection, price, accepted, expired } = useCheckout()
  const summaryUrl = `/explorar/${boatId}/pago?${params}`
  // Es una barrera de navegación local, no una autorización del servidor.
  if (!accepted) return <Navigate to={summaryUrl} replace />

  const { start, end, pax } = selection
  const days = price.days

  return (
    <>
      <button type="button" className={styles.back} onClick={() => navigate(summaryUrl)}>‹ Volver al resumen</button>
      <h1 className={styles.title}>Método de pago</h1>
      <CheckoutTimer />
      <p className={styles.muted}>Último paso: datos de contacto y pago.</p>

      <div className={styles.pay}>
        <div>
          <section className={styles.panel} aria-labelledby="payment-details-title">
            <h2 id="payment-details-title">Datos de contacto y pago</h2>
            {!expired && <>
              <PaymentDetails />
            </>}
            {expired && <Button onClick={() => navigate(`/explorar/${boatId}`)}>Volver a la embarcación</Button>}
          </section>
          <PaymentConfirmationPanel />
        </div>

        <aside className={styles.sidebar}>
          <section className={styles.panel}>
            <h2>Tu reserva</h2>
            <div className={styles.boatRow}>
              <div>
                <h3>{boat.name}</h3>
                <p>{formatRange(start, end)} · {days} {days === 1 ? 'día' : 'días'} · {pax} {pax === 1 ? 'pasajero' : 'pasajeros'}</p>
              </div>
            </div>
            <span className={styles.muted}>Total estimado</span>
            <p className={styles.bigTotal}>{copDecimal(price.total)}</p>
            <p className={styles.payNote}>Política de Cancelación aceptada en el resumen.</p>
          </section>
          <Button block onClick={() => navigate(summaryUrl)}>Revisar resumen</Button>
        </aside>
      </div>
    </>
  )
}
