import { useState } from 'react'
import { Dropdown, Input, Pagination } from '@/components/ui'
import { FilterChips } from '../components/FilterChips'
import { RecordsTable } from '../components/RecordsTable'
import { isUUID } from '@/lib/uuid'
import { OWNER_ID, TYPE_LABEL } from '../api'
import { m3ErrorMessage } from '../errors'
import { useRecords } from '../hooks'
import styles from '../components/FinanceUI.module.css'

const TYPES = [{ value: '', label: 'Todos' }, ...Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label }))]
const SIZES = [{ value: '5', label: '5' }, { value: '10', label: '10 · por defecto' }, { value: '20', label: '20' }]
const UUID_HINT = 'Ingresa un UUID válido'

/** Registros financieros (feature 012). scope: 'owner' (propietario fijo) | 'admin' (filtro opcional). */
export default function FinanceRecordsPage({ scope }) {
  const [ownerId, setOwnerId] = useState('')
  const [type, setType] = useState('')
  const [boatId, setBoatId] = useState('')
  const [reservationId, setReservationId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)

  // Un UUID inválido no se envía (400 VALIDATION_ERROR) y se señala en el campo.
  const ownerOk = isUUID(ownerId)
  const boatOk = boatId.trim() === '' || isUUID(boatId)
  const reservationOk = reservationId.trim() === '' || isUUID(reservationId)
  const resetPage = (setter) => (value) => { setter(value); setPage(1) }

  const { data, isPending, isError, error } = useRecords({
    scope,
    ownerId: ownerOk ? ownerId.trim() : '',
    type,
    boatId: boatOk ? boatId.trim() : '',
    reservationId: reservationOk ? reservationId.trim() : '',
    dateFrom,
    dateTo,
    page,
    pageSize,
  })

  return (
    <>
      <p className={styles.eyebrow}>Feature 012</p>
      <h1 className={styles.title}>Registros financieros</h1>
      <p className={styles.lead}>Consulta operaciones confirmadas, filtradas por alcance y paginadas.</p>

      <div className={`${styles.panel} ${styles.panelRow}`}>
        <div style={{ width: 240 }}>
          {scope === 'owner'
            ? <Input label="owner_id" value={OWNER_ID} readOnly />
            : <Input label="owner_id (opcional)" placeholder="UUID del propietario" value={ownerId} onChange={(e) => resetPage(setOwnerId)(e.target.value)} error={ownerId.trim() !== '' && !ownerOk && UUID_HINT} />}
        </div>
        <div style={{ width: 200 }}>
          <Dropdown label="Tamaño de página" options={SIZES} value={String(pageSize)} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} />
        </div>
      </div>

      <div className={`${styles.panel} ${styles.panelRow}`}>
        <div style={{ width: 250 }}>
          <Input label="Embarcación (boat_id)" placeholder="UUID · opcional" value={boatId} onChange={(e) => resetPage(setBoatId)(e.target.value)} error={!boatOk && UUID_HINT} />
        </div>
        <div style={{ width: 250 }}>
          <Input label="Reserva (reservation_id)" placeholder="UUID · opcional" value={reservationId} onChange={(e) => resetPage(setReservationId)(e.target.value)} error={!reservationOk && UUID_HINT} />
        </div>
        <div style={{ width: 170 }}>
          <Input label="Creado desde" type="date" value={dateFrom} onChange={(e) => resetPage(setDateFrom)(e.target.value)} />
        </div>
        <div style={{ width: 170 }}>
          <Input label="Creado hasta" type="date" value={dateTo} onChange={(e) => resetPage(setDateTo)(e.target.value)} />
        </div>
      </div>

      <FilterChips label="Filtrar por tipo" options={TYPES} value={type} onChange={resetPage(setType)} />

      {isPending && <p className={styles.empty}>Cargando…</p>}
      {isError && (
        <p className={styles.empty} role="alert">
          {m3ErrorMessage(error)}
        </p>
      )}
      {data && (
        <>
          <RecordsTable rows={data.items} />
          <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} total={data.total} pageSize={pageSize} />
        </>
      )}
    </>
  )
}
