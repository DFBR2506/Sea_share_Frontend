import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import boatIcon from '@/assets/icons/boat.svg'
import { StatGrid } from '@/components/cards'
import { Button } from '@/components/ui'
import { CancelReservationModal } from '../components/CancelReservationModal'
import { useBoat, useReservation } from '../hooks'
import styles from './pages.module.css'
import owner from './owner.module.css'

export default function ReservationDetailPage() {
  const { reservationId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: res, isPending, error } = useReservation(reservationId)
  const { data: boat, error: boatError } = useBoat(res?.boatId)
  const [cancelling, setCancelling] = useState(false)

  if (error) return <p role="alert" className={styles.state}>{error.message}</p>
  if (isPending) return <p className={styles.state}>Cargando…</p>
  if (boatError) return <p role="alert" className={styles.state}>{boatError.message}</p>
  if (!res || !boat) return <p className={styles.state}>No encontramos esta reserva.</p>

  const b = res.breakdown
  const canCancel = res.status === 'CONFIRMADA'

  return (
    <>
      <button type="button" className={styles.back} onClick={() => navigate('/mis-reservas')}>Mis reservas &gt; Ver detalles</button>
      <div className={styles.resDetail}>
        <div>
          <h1 className={styles.title}>{boat.name}</h1>
          <p className={styles.muted}>{boat.location}</p>
          <p className={styles.muted}>{boat.passengers} pasajeros · {boat.cabins} camarotes{boat.lengthM != null && <> · {boat.lengthM} m de eslora</>}</p>
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
            <span className={styles.muted}>{res.sectionTitle ?? 'Resumen de pago'}</span>
            <div className={styles.lines} style={{ margin: '12px 0' }}>
              <div className={styles.line}><span>Tarifa base</span><span>{b.base ?? '—'}</span></div>
              <div className={styles.line}><span>Comisión</span><span>{b.commission ?? '—'}</span></div>
              <div className={styles.line}><span>Seguro</span><span>{b.insurance ?? '—'}</span></div>
              <div className={styles.line}><span>Depósito</span><span>{b.deposit ?? '—'}</span></div>
            </div>
            <div className={styles.paid}><span>{res.totalPaid != null ? 'Total pagado' : res.calculatedTotal != null ? 'Total calculado' : res.estimatedTotal != null ? 'Total estimado' : 'Sin importe'}</span><strong>{res.totalPaid ?? res.calculatedTotal ?? res.estimatedTotal ?? ''}</strong></div>
            {res.clarifyingNote != null && <p className={styles.muted}>{res.clarifyingNote}</p>}
          </section>
          {canCancel && (
            <Button variant="outlineDanger" block onClick={() => setCancelling(true)}>✕ Cancelar reserva</Button>
          )}
        </aside>
      </div>

      <CancelReservationModal
        key={`${res.id}-${cancelling}`}
        open={cancelling}
        onClose={() => setCancelling(false)}
        onConfirm={() => { queryClient.invalidateQueries({ queryKey: ['m2'] }) }}
        reservation={res}
        boatName={boat.name}
      />
    </>
  )
}
