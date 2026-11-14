import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import boatIcon from '@/assets/icons/boat.svg'
import { StatGrid } from '@/components/cards'
import { Button } from '@/components/ui'
import { copMoney } from '@/lib/dates'
import { CancelReservationModal } from '../components/CancelReservationModal'
import { useBoat, useReservation } from '../hooks'
import styles from './pages.module.css'
import owner from './owner.module.css'

export default function ReservationDetailPage() {
  const { reservationId } = useParams()
  const navigate = useNavigate()
  const { data: res, isPending } = useReservation(reservationId)
  const { data: boat } = useBoat(res?.boatId)
  const [cancelling, setCancelling] = useState(false)

  if (isPending) return <p className={styles.state}>Cargando…</p>
  if (!res || !boat) return <p className={styles.state}>No encontramos esta reserva.</p>

  const b = res.breakdown
  const cancelled = res.status === 'CANCELADA'

  return (
    <>
      <button type="button" className={styles.back} onClick={() => navigate('/mis-reservas')}>Mis reservas &gt; Ver detalles</button>
      <div className={styles.resDetail}>
        <div>
          <h1 className={styles.title}>{boat.name}</h1>
          <p className={styles.muted}>{boat.location}</p>
          <p className={styles.muted}>{boat.passengers} pasajeros · {boat.cabins} camarotes · {boat.lengthM} m de eslora</p>
          <div className={owner.gallery} aria-label="Fotos del barco">
            <div className={owner.empty}><img src={boatIcon} alt="" width="28" height="28" /><span>Sin fotos disponibles</span></div>
            <div className={owner.empty}><img src={boatIcon} alt="" width="20" height="20" /></div>
            <div className={owner.empty}><img src={boatIcon} alt="" width="20" height="20" /></div>
          </div>
          <StatGrid items={[
            { value: boat.passengers, label: 'PASAJEROS' },
            { value: boat.captain ? 'Sí' : 'No', label: 'CAP. INCLUIDO' },
            { value: `${boat.lengthFt} ft`, label: 'ESLORA' },
            { value: boat.cabins, label: 'CAMAROTES' },
          ]} />
          <h2 className={styles.sectionTitle}>Servicios que incluye su reserva</h2>
          <div className={styles.services}>
            {boat.amenities.map((a) => <div key={a} className={styles.service}>{a}</div>)}
          </div>
          <p className={styles.muted} style={{ margin: '16px 0 0' }}>Anfitrión: {boat.host.name} · {boat.host.badge}</p>
          <section className={`${styles.panel} ${styles.itinerary} ${owner.sheet}`}>
            <h2>Itinerario</h2>
            <div className={styles.lines}>
              <div className={styles.line}><span>Embarque</span><span>{res.embark}</span></div>
              <div className={styles.line}><span>Desembarque</span><span>{res.disembark}</span></div>
              <div className={styles.line}><span>Puerto de zarpe</span><span>{boat.shortLocation}</span></div>
              <div className={styles.line}><span>Pasajeros</span><span>{res.pax} adultos</span></div>
            </div>
          </section>
        </div>

        <aside>
          <section className={`${styles.panel} ${styles.paySummary} ${owner.sheet}`}>
            <span className={styles.muted}>Resumen de pago</span>
            <div className={styles.lines} style={{ margin: '12px 0' }}>
              <div className={styles.line}><span>Alquiler ({b.days} {b.days === 1 ? 'día' : 'días'})</span><span>{copMoney(b.base)}</span></div>
              <div className={styles.line}><span>Seguro náutico ({res.pax} × {copMoney(b.insurancePerPassenger)})</span><span>{copMoney(b.insurance)}</span></div>
              <div className={styles.line}><span>Depósito de garantía</span><span>{copMoney(b.deposit)}</span></div>
            </div>
            <div className={styles.paid}><span>Total pagado:</span><strong>{copMoney(res.total)}</strong></div>
          </section>
          {!cancelled && (
            <Button variant="outlineDanger" block onClick={() => setCancelling(true)}>✕ Cancelar reserva</Button>
          )}
        </aside>
      </div>

      <CancelReservationModal
        open={cancelling}
        onClose={() => setCancelling(false)}
        onConfirm={() => { setCancelling(false); navigate('/mis-reservas') }}
        reservation={res}
        boatName={boat.name}
      />
    </>
  )
}
