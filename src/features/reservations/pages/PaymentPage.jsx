import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui'
import { formatRange, money, nightsBetween } from '@/lib/dates'
import { useCheckout } from '../checkout/checkoutContext'
import CheckoutTimer from '../checkout/CheckoutTimer'
import styles from './pages.module.css'

export default function PaymentPage() {
  const { boatId } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { boat, selection, price: p, accepted, setAccepted, expired, canContinue } = useCheckout()
  const { start, end, pax } = selection
  const nights = Math.max(nightsBetween(start, end), 1)
  const lines = [
    ['Tarifa base', p.base],
    ['Comisión', p.commission],
    ['Seguro', p.insurance],
    ['Depósito', p.deposit],
  ]

  return (
    <>
      <h1 className={styles.title}>Pago</h1>
      <CheckoutTimer />

      <div className={styles.pay} style={{ marginTop: 16 }}>
        <div>
          <section className={styles.panel}>
            <div className={styles.boatRow}>
              <div className={styles.thumb} />
              <div>
                <h3>{boat.name}</h3>
                <p>{formatRange(start, end)} · {nights} noches · {pax} {pax === 1 ? 'pasajero' : 'pasajeros'}</p>
                <p>{boat.captain ? 'Viaje con capitán' : 'Sin capitán'} · {boat.shortLocation}</p>
              </div>
            </div>
          </section>

          <section className={styles.panel}>
            <h2>Detalle del precio</h2>
            <div className={styles.lines}>
              <div className={styles.line}><span>Tarifa base ({nights} días × ${boat.pricePerDay})</span><span>{money(p.base)}</span></div>
              <div className={styles.line}><span>Comisión de la plataforma</span><span>{money(p.commission)}</span></div>
              <div className={styles.line}><span>Seguro náutico</span><span>{money(p.insurance)}</span></div>
              <div className={styles.line}><span>Depósito de garantía (reembolsable)</span><span>{money(p.deposit)}</span></div>
              <div className={`${styles.line} ${styles.total}`}><span>Total</span><span>{money(p.total)}</span></div>
              <small>El depósito se reembolsa completo si el barco se devuelve sin daños.</small>
            </div>
          </section>

          <label className={`${styles.panel} ${styles.consent}`}>
            <input type="checkbox" checked={accepted} disabled={expired} onChange={(e) => setAccepted(e.target.checked)} />
            <span>Acepto la Política de Cancelación<small>Cancelación gratis hasta 72h antes del inicio del viaje.</small></span>
          </label>
        </div>

        <aside className={styles.sidebar}>
          <section className={styles.panel}>
            <span className={styles.muted}>Total a pagar</span>
            <p className={styles.bigTotal}>{money(p.total)}</p>
            <div className={styles.lines}>
              {lines.map(([label, v]) => <div key={label} className={styles.line}><span>{label}</span><span>{money(v)}</span></div>)}
            </div>
          </section>
          <Button block disabled={!accepted || expired} onClick={() => {
            if (canContinue()) navigate(`/explorar/${boatId}/pago/metodo?${params}`)
          }}>Confirmar y Pagar</Button>
          {expired && <Button block onClick={() => navigate(`/explorar/${boatId}`)} style={{marginTop: "0.5lh"}}>Volver a la embarcación</Button>}
          {!accepted && <p className={styles.payNote}>Se requiere tu consentimiento para completar el pago.</p>}
        </aside>
      </div>
    </>
  )
}
