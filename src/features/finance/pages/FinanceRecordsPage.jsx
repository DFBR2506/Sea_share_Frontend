import { useState } from 'react'
import { Dropdown, Input, Pagination } from '@/components/ui'
import { FilterChips } from '../components/FilterChips'
import { RecordsTable } from '../components/RecordsTable'
import { OWNER_ID, OWNERS, TYPE_LABEL } from '../api/mocks'
import { useRecords } from '../hooks'
import styles from '../components/FinanceUI.module.css'

const TYPES = [{ value: '', label: 'Todos' }, ...Object.entries(TYPE_LABEL).map(([value, label]) => ({ value, label }))]
const SIZES = [{ value: '5', label: '5' }, { value: '10', label: '10 · por defecto' }, { value: '20', label: '20' }]

/** Registros financieros (feature 012). scope: 'owner' (propietario fijo) | 'admin' (filtro opcional). */
export default function FinanceRecordsPage({ scope }) {
  const [ownerId, setOwnerId] = useState('')
  const [type, setType] = useState('')
  const [pageSize, setPageSize] = useState(10)
  const [page, setPage] = useState(1)
  const { data, isPending, isError } = useRecords({ scope, ownerId, type, page, pageSize })

  return (
    <>
      <p className={styles.eyebrow}>Feature 012</p>
      <h1 className={styles.title}>Registros financieros</h1>
      <p className={styles.lead}>Consulta operaciones confirmadas, filtradas por alcance y paginadas.</p>

      <div className={`${styles.panel} ${styles.panelRow}`}>
        <div style={{ width: 240 }}>
          {scope === 'owner'
            ? <Input label="owner_id" value={OWNER_ID} readOnly />
            : <Dropdown label="Propietario (opcional)" placeholder="Todos" options={OWNERS} value={ownerId} onChange={(e) => { setOwnerId(e.target.value); setPage(1) }} />}
        </div>
        <div style={{ width: 200 }}>
          <Dropdown label="Tamaño de página" options={SIZES} value={String(pageSize)} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }} />
        </div>
      </div>

      <FilterChips label="Filtrar por tipo" options={TYPES} value={type} onChange={(v) => { setType(v); setPage(1) }} />

      {isPending && <p className={styles.empty}>Cargando…</p>}
      {isError && <p className={styles.empty} role="alert">No se pudieron cargar los registros.</p>}
      {data && (
        <>
          <RecordsTable rows={data.items} />
          <Pagination page={page} totalPages={Math.ceil(data.total / pageSize)} onPageChange={setPage} total={data.total} pageSize={pageSize} />
        </>
      )}
    </>
  )
}
