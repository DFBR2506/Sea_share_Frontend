import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { BoatCard } from '@/components/cards'
import { FilterBar } from '@/components/filters'
import { copDecimal } from '@/lib/dates'
import { useNow } from '@/lib/useNow'
import { harborDateTime } from '../checkout/departure'
import { m3ErrorMessage } from '@/features/finance/errors'
import { useEstimateBatch } from '@/features/finance/hooks'
import { listBoats } from '../api'
import styles from './pages.module.css'

const TYPES = [{ value: 'velero', label: 'Velero' }, { value: 'yate', label: 'Yate' }, { value: 'catamaran', label: 'Catamarán' }]
const BACKEND_TYPES = { velero: 'SAILBOAT', yate: 'YACHT', catamaran: 'CATAMARAN' }

export default function ExplorePage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState([])
  const [passengers, setPassengers] = useState('')
  const [passengersOpen, setPassengersOpen] = useState(false)
  const [datesOpen, setDatesOpen] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const today = harborDateTime(useNow()).date
  const validPassengers = passengers === '' || (Number.isInteger(Number(passengers)) && Number(passengers) > 0)
  const validDates = (!startDate || startDate >= today) && (!endDate || endDate >= today) && (!startDate || !endDate || endDate >= startDate)
  const validFilters = validPassengers && validDates
  const { data: result, isPending, error } = useQuery({
    queryKey: ['m2', 'boats', 'explore', selected, passengers, startDate, endDate],
    queryFn: async ({ signal }) => {
      const types = selected.length ? selected.map((value) => BACKEND_TYPES[value]) : [undefined]
      const groups = await Promise.all(types.map((type) => listBoats({
        type, passengers: passengers === '' ? undefined : Number(passengers), startDate, endDate, includePagination: true, signal,
      })))
      return {
        vessels: [...new Map(groups.flatMap((group) => group.vessels).map((boat) => [boat.id, boat])).values()],
        pagination: groups[0].pagination,
      }
    },
    enabled: validFilters, retry: false,
  })

  const visible = validFilters ? result?.vessels ?? [] : []
  const toggle = (v) => setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))

  // UC01: estimacion por lote para hoy con 1 dia, 1 pasajero y seguro.
  // El id de la embarcación es el UUID de Flota (M1) que M3 también usa.
  const boatIds = [...new Set(visible.map((b) => b.id).filter(Boolean))]
  const { data: batch, isError: estimatesFailed, error: estimatesError } = useEstimateBatch(boatIds)

  const priceOf = (boat) => {
    const total = batch?.amounts[boat.id]
    if (total != null) return `≈ ${copDecimal(total)} · 1 día · 1 pasajero`
    if (estimatesFailed || batch) return 'Precio no disponible'
    return 'Consultando…'
  }

  return (
    <>
      <h1 className={styles.title}>Populares esta semana</h1>
      <p className={styles.muted}>{validFilters && isPending ? 'Cargando…' : !error && validFilters ? `${result?.pagination.total_items ?? '—'} resultados` : ''}</p>
      <div className={styles.filters}>
        <FilterBar dates={startDate && endDate ? `${startDate} – ${endDate}` : 'Elegir fechas'} passengers={passengers} types={TYPES} selectedTypes={selected} onToggleType={toggle}
          onDatesClick={() => setDatesOpen((open) => !open)}
          onPassengersClick={() => setPassengersOpen((open) => !open)} />
      </div>
      {datesOpen && <div className={styles.filterPanel}>
        <label className={styles.filterField}>Inicio <input className={styles.filterInput} aria-label="Fecha de inicio" type="date" min={today} value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
        {' '}
        <label className={styles.filterField}>Fin <input className={styles.filterInput} aria-label="Fecha de fin" type="date" value={endDate} min={startDate > today ? startDate : today} onChange={(event) => setEndDate(event.target.value)} /></label>
      </div>}
      {passengersOpen && <label className={styles.filterPanel + ' ' + styles.filterField}>Pasajeros
        <input className={styles.filterInput} aria-label="Pasajeros" type="number" min="1" step="1" value={passengers}
          onChange={(event) => setPassengers(event.target.value)} />
      </label>}
      {!validPassengers && <p role="alert" className={styles.state}>Elige una cantidad entera de pasajeros mayor que cero.</p>}
      {!validDates && <p role="alert" className={styles.state}>Elige fechas desde hoy y una fecha de fin igual o posterior al inicio.</p>}
      {error && <p role="alert" className={styles.state}>{error.message}</p>}
      {validFilters && !error && !isPending && visible.length === 0 && <p className={styles.state}>No hay embarcaciones con esos filtros.</p>}
      {estimatesFailed && <p className={styles.state} role="alert">No se pudieron obtener las estimaciones de precio: {m3ErrorMessage(estimatesError)}</p>}
      <div className={styles.grid}>
        {visible.map((b) => (
          <BoatCard
            key={b.id}
            name={b.name}
            imageUrl={b.imageUrl}
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
