import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui'
import { cx } from '@/lib/cx'
import { money } from '@/lib/dates'
import { RESERVATION_STATUS_UI } from '../api/ownerMocks'
import { useBoats, useOwnerReservations } from '../hooks'
import styles from './pages.module.css'

export default function OwnerReservationsPage() {
  const navigate = useNavigate()
  const { data: reservations = [], isPending } = useOwnerReservations()
  const { data: boats } = useBoats()
  const [tab, setTab] = useState('historial')

  const shown = reservations.filter((r) => (tab === 'canceladas' ? r.status === 'CANCELADA' : true))
  const boatName = (id) => boats?.find((b) => b.id === id)?.name ?? '…'

  return (
    <>
      <h1 className={styles.title}>Reservas recibidas</h1>
      <p className={styles.muted}>{isPending ? 'Cargando…' : `${reservations.length} en total`}</p>
      <div className={styles.tabs} role="tablist">
        {[['historial', 'Historial'], ['canceladas', 'Canceladas']].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={cx(styles.tab, tab === id && styles.tabActive)} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {!isPending && shown.length === 0 && <p className={styles.state}>No hay reservas en esta vista.</p>}
      <div className={styles.list}>
        {shown.map((r) => {
          const ui = RESERVATION_STATUS_UI[r.status]
          return (
            <article key={r.id} className={styles.resCard}>
              <div className={styles.thumb}>FOTO</div>
              <div className={styles.resInfo}>
                <h3>{boatName(r.boatId)}</h3>
                <p>{r.dates} · {r.duration} · {r.guest} · {r.pax} pasajeros</p>
                {r.cancelNote && <p>{r.cancelNote}</p>}
              </div>
              <div className={styles.resSide}>
                <button type="button" className={styles.link} onClick={() => navigate(`/owner/reservas/${r.id}`)}>Ver detalles ›</button>
                <span className={styles.amount}>{money(r.total)}</span>
                <StatusBadge tone={ui.tone}>{ui.label}</StatusBadge>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
