import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SlidingTabs, StatusBadge } from '@/components/ui'
import { copMoney } from '@/lib/dates'
import { getReservationStatusUI } from '../api/statusMap'
import { useReservations } from '../hooks'
import { reservationView } from '../reservationViews'
import { VesselPhoto } from '@/components/cards/VesselPhoto'
import styles from './pages.module.css'
import owner from './owner.module.css'

export default function MyReservationsPage() {
  const navigate = useNavigate()
  const { data: reservations, isPending, error } = useReservations()
  const [tab, setTab] = useState('historial')

  const all = reservations ?? []
  const shown = reservationView(all, tab)

  if (error) return <p role="alert" className={styles.state}>{error.code}: {error.message}</p>

  return (
    <>
      <h1 className={styles.title}>Mis reservas</h1>
      <p className={styles.muted}>{isPending ? 'Cargando…' : `${shown.length} en esta vista`}</p>
      <div className={owner.tabs}>
        <SlidingTabs role="tablist" ariaLabel="Vista de reservas" value={tab} onChange={setTab} items={[{ value: 'historial', label: 'Historial' }, { value: 'canceladas', label: 'Canceladas' }]} />
      </div>
      {!isPending && shown.length === 0 && <p className={styles.state}>No tienes reservas en esta vista.</p>}
      <div className={owner.list}>
        {shown.map((r) => {
          const ui = getReservationStatusUI(r.status)
          const open = () => navigate(`/mis-reservas/${r.id}`)
          return (
            <article
              key={r.id}
              className={owner.card}
              onClick={open}
              onKeyDown={(e) => e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), open())}
              tabIndex={0}
              role="link"
            >
              <VesselPhoto src={r.imageUrl} name={r.boatName} className={owner.thumb} />
              <div className={owner.info}>
                <h3>{r.boatName || 'Embarcación'}</h3>
                <p>{r.status === 'CANCELADA' ? r.duration : `${r.dates} · ${r.duration}`}</p>
                {r.note && <p>{r.note}</p>}
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
