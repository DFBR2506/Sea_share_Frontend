import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlidingTabs, StatusBadge } from '@/components/ui'
import { copMoney } from '@/lib/dates'
import { getReservationStatusUI } from '../api/statusMap'
import { useOwnerReservations } from '../hooks'
import styles from './pages.module.css'
import owner from './owner.module.css'

export default function OwnerReservationsPage() {
  const navigate = useNavigate()
  const { data: reservations = [], isPending, error } = useOwnerReservations()
  const [tab, setTab] = useState('historial')

  const shown = reservations.filter((r) => (tab === 'canceladas' ? r.status === 'CANCELADA' : true))

  if (error) return <p role="alert" className={styles.state}>{error.code}: {error.message}</p>

  return (
    <>
      <h1 className={styles.title}>Reservas recibidas</h1>
      <p className={styles.muted}>{isPending ? 'Cargando…' : `${reservations.length} en total`}</p>
      <div className={owner.tabs}>
        <SlidingTabs role="tablist" ariaLabel="Vista de reservas" value={tab} onChange={setTab} items={[{ value: 'historial', label: 'Historial' }, { value: 'canceladas', label: 'Canceladas' }]} />
      </div>
      {!isPending && shown.length === 0 && <p className={styles.state}>No hay reservas en esta vista.</p>}
      <div className={owner.list}>
        {shown.map((r) => {
          const ui = getReservationStatusUI(r.status)
          const open = () => navigate(`/owner/reservas/${r.id}`)
          return (
            <article
              key={r.id}
              className={owner.card}
              onClick={open}
              onKeyDown={(e) => e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
              tabIndex={0}
              role="link"
            >
              <div className={owner.thumb}>FOTO</div>
              <div className={owner.info}>
                <h3>{r.boatName}</h3>
                <p>{r.dates} · {r.duration} · {r.guest} · {r.pax} pasajeros</p>
                {r.cancelNote && <p>{r.cancelNote}</p>}
              </div>
              <div className={owner.side}>
                <button type="button" className={owner.link} onClick={(e) => { e.stopPropagation(); open() }}>Ver detalles ›</button>
                <span className={owner.amount}>{copMoney(r.total)}</span>
                <StatusBadge tone={ui.tone}>{ui.label}</StatusBadge>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
