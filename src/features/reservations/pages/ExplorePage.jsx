import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BoatCard } from '@/components/cards'
import { FilterBar } from '@/components/filters'
import { moneyInt } from '@/lib/dates'
import { useBoats } from '../hooks'
import styles from './pages.module.css'

const TYPES = [{ value: 'velero', label: 'Velero' }, { value: 'yate', label: 'Yate' }, { value: 'catamaran', label: 'Catamarán' }]

export default function ExplorePage() {
  const navigate = useNavigate()
  const { data: boats, isPending } = useBoats()
  const [selected, setSelected] = useState([])

  const visible = (boats ?? []).filter((b) => selected.length === 0 || selected.includes(b.type))
  const toggle = (v) => setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))

  return (
    <>
      <h1 className={styles.title}>Populares esta semana</h1>
      <p className={styles.muted}>{isPending ? 'Cargando…' : `${visible.length} resultados`}</p>
      <div className={styles.filters}>
        <FilterBar dates="19 sep – 25 sep" passengers="2" types={TYPES} selectedTypes={selected} onToggleType={toggle} />
      </div>
      {!isPending && visible.length === 0 && <p className={styles.state}>No hay embarcaciones con esos filtros.</p>}
      <div className={styles.grid}>
        {visible.map((b) => (
          <BoatCard
            key={b.id}
            name={b.name}
            meta={`${b.shortLocation} · ${b.passengers} pasajeros · ${b.captain ? 'Capitán incluido' : 'Sin capitán'}`}
            price={`${moneyInt(b.pricePerDay).replace(/^/, '')} / día`}
            actionVariant="secondary"
            onAction={() => navigate(`/explorar/${b.id}`)}
            onClick={() => navigate(`/explorar/${b.id}`)}
          />
        ))}
      </div>
    </>
  )
}
