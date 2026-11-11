import { Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui'
import { formatRange, money, nightsBetween } from '@/lib/dates'
import { priceBreakdown } from '../api'
import { readPaymentSelection } from '../checkout/selection'
import { useBoat } from '../hooks'
import styles from './pages.module.css'

export default function PaymentMethodPage() {
  const { boatId } = useParams()
  const [params] = useSearchParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const { data: boat, isPending } = useBoat(boatId)
  const summaryUrl = `/explorar/${boatId}/pago?${params}`
  const review = state?.paymentReview
  const hasConsent = review?.accepted === true
    && review.boatId === boatId && review.search === params.toString()
  const selection = readPaymentSelection(params, boat?.passengers)

  // Es una barrera de navegación local, no una autorización del servidor.
  if (!hasConsent) return <Navigate to={summaryUrl} replace />
  if (isPending) return <p className={styles.state}>Cargando…</p>
  if (!boat || !selection) return <Navigate to={summaryUrl} replace />

  const { start, end, pax } = selection
  const nights = nightsBetween(start, end)
  const price = priceBreakdown(boat.pricePerDay, nights)

  return (
    <>
      <button type="button" className={styles.back} onClick={() => navigate(summaryUrl)}>‹ Volver al resumen</button>
      <h1 className={styles.title}>Método de pago</h1>
      <p className={styles.muted}>Último paso: datos de contacto y pago.</p>

      <div className={styles.pay}>
        <section className={styles.panel} aria-labelledby="payment-details-title">
          <h2 id="payment-details-title">Datos de contacto y pago</h2>
          <p className={styles.muted}>Aquí completarás tus datos de contacto y elegirás el método de pago con MercadoPago.</p>
          <p className={styles.payNote} role="status">El formulario Payment Brick estará disponible en una próxima fase. No se han solicitado datos de tarjeta ni realizado ningún cobro.</p>
        </section>

        <aside className={styles.sidebar}>
          <section className={styles.panel}>
            <h2>Tu reserva</h2>
            <div className={styles.boatRow}>
              <div>
                <h3>{boat.name}</h3>
                <p>{formatRange(start, end)} · {nights} noches · {pax} {pax === 1 ? 'pasajero' : 'pasajeros'}</p>
              </div>
            </div>
            <span className={styles.muted}>Total a pagar</span>
            <p className={styles.bigTotal}>{money(price.total)}</p>
            <p className={styles.payNote}>Política de Cancelación aceptada en el resumen.</p>
          </section>
          <Button block onClick={() => navigate(summaryUrl)}>Revisar resumen</Button>
        </aside>
      </div>
    </>
  )
}
