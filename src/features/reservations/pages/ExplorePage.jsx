import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BoatCard } from '@/components/cards'
import { FilterBar } from '@/components/filters'
import { copDecimal } from '@/lib/dates'
import { m3ErrorMessage } from '@/features/finance/errors'
import { useEstimateBatch } from '@/features/finance/hooks'
import { useBoats } from '../hooks'
import { boatUuid } from '../api'
import styles from './pages.module.css'

const TYPES = [{ value: 'velero', label: 'Velero' }, { value: 'yate', label: 'Yate' }, { value: 'catamaran', label: 'Catamarán' }]

export default function ExplorePage() {
  const navigate = useNavigate()
  const { data: boats, isPending } = useBoats()
  const [selected, setSelected] = useState([])

  const visible = (boats ?? []).filter((b) => selected.length === 0 || selected.includes(b.type))
  const toggle = (v) => setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))

  // UC01 · estimación por lote: la de HOY con 1 día y 1 pasajero (incluye seguro), no la
  // tarifa diaria. Solo se consultan las embarcaciones mapeadas al stub de Flota (boatUuid).
  const boatIds = [...new Set(visible.map((b) => boatUuid(b.id)).filter(Boolean))]
  const { data: batch, isError: estimatesFailed, error: estimatesError } = useEstimateBatch(boatIds)

  const priceOf = (boat) => {
    const uuid = boatUuid(boat.id)
    const total = batch?.amounts[uuid]
    if (total != null) return `≈ ${copDecimal(total)} · 1 día · 1 pasajero`
    if (estimatesFailed || batch) return 'Precio no disponible'
    return 'Consultando…'
  }

  return (
    <>
      <h1 className={styles.title}>Populares esta semana</h1>
      <p className={styles.muted}>{isPending ? 'Cargando…' : `${visible.length} resultados`}</p>
      <div className={styles.filters}>
        <FilterBar dates="19 sep – 25 sep" passengers="2" types={TYPES} selectedTypes={selected} onToggleType={toggle} />
      </div>
      {!isPending && visible.length === 0 && <p className={styles.state}>No hay embarcaciones con esos filtros.</p>}
      {estimatesFailed && <p className={styles.state} role="alert">No se pudieron obtener las estimaciones de precio: {m3ErrorMessage(estimatesError)}</p>}
      <div className={styles.grid}>
        {visible.map((b) => (
          <BoatCard
            key={b.id}
            name={b.name}
            meta={`${b.shortLocation} · ${b.passengers} pasajeros · ${b.captain ? 'Capitán incluido' : 'Sin capitán'}`}
            price={priceOf(b)}
            actionVariant="primary"
            onAction={() => navigate(`/explorar/${b.id}`)}
            onClick={() => navigate(`/explorar/${b.id}`)}
          />
        ))}
      </div>
    </>
  )
}
