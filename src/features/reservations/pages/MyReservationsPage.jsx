import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { StatusBadge } from '@/components/ui'
import { cx } from '@/lib/cx'
import { money } from '@/lib/dates'
import { STATUS_UI } from '../api/mocks'
import { useBoats, useReservations } from '../hooks'
import styles from './pages.module.css'

export default function MyReservationsPage() {
  const navigate = useNavigate()
  const { data: reservations, isPending } = useReservations()
  const { data: boats } = useBoats()
  const [tab, setTab] = useState('historial')

  const all = reservations ?? []
  const shown = all.filter((r) => (tab === 'canceladas' ? r.status === 'CANCELADA' : true))
  const boatName = (id) => boats?.find((b) => b.id === id)?.name ?? '…'

  return (
    <>
      <h1 className={styles.title}>Mis reservas</h1>
      <p className={styles.muted}>{isPending ? 'Cargando…' : `${all.length} en total`}</p>
      <div className={styles.tabs} role="tablist">
        {[['historial', 'Historial'], ['canceladas', 'Canceladas']].map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={cx(styles.tab, tab === id && styles.tabActive)} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {!isPending && shown.length === 0 && <p className={styles.state}>No tienes reservas en esta vista.</p>}
      <div className={styles.list}>
        {shown.map((r) => (
          <article key={r.id} className={styles.resCard}>
            <div className={styles.thumb}>FOTO</div>
            <div className={styles.resInfo}>
              <h3>{boatName(r.boatId)}</h3>
              <p>{r.status === 'CANCELADA' ? r.duration : `${r.dates} · ${r.duration}`}</p>
              {r.note && <p>{r.note}</p>}
            </div>
            <div className={styles.resSide}>
              <button type="button" className={styles.link} onClick={() => navigate(`/mis-reservas/${r.id}`)}>Ver detalles ›</button>
              <span className={styles.amount}>{money(r.total)}</span>
              <StatusBadge tone={STATUS_UI[r.status].tone}>{STATUS_UI[r.status].label}</StatusBadge>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
