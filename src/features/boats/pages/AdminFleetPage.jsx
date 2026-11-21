import { useDeferredValue, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, DataTable, Dropdown, StatusPill } from '@/components/ui'
import { OwnerSearch } from '../components/OwnerSearch'
import { STATUS_OPTIONS, STATUS_UI } from '../constants'
import { typeName } from '../format'
import { useAllVessels, useFleetOwners } from '../hooks'
import styles from './pages.module.css'

export default function AdminFleetPage() {
  const navigate = useNavigate()
  const [ownerId, setOwnerId] = useState('')
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query.trim())
  const { data: owners = [] } = useFleetOwners()
  const { data: rows = [], isPending, error } = useAllVessels({ ownerId, status, query: deferredQuery })

  const columns = [
    { key: 'name', header: 'Embarcación', render: (v) => <span style={{ fontWeight: 700, fontSize: 13 }}>{v.name}</span> },
    { key: 'owner', header: 'Propietario', render: (v) => <button type="button" className={styles.link} onClick={() => navigate(`/admin/propietarios/${v.ownerId}`)}>{v.owner?.name}</button> },
    { key: 'plate', header: 'Matrícula' },
    { key: 'type', header: 'Tipo', render: (v) => typeName(v.type) },
    { key: 'status', header: 'Estado operativo', render: (v) => <StatusPill tone={STATUS_UI[v.status]?.tone}>{STATUS_UI[v.status]?.label ?? v.status}</StatusPill> },
    { key: 'actions', header: 'Acciones', render: (v) => <Button variant="outline" square onClick={() => navigate(`/admin/embarcaciones/${v.id}`)}>Ver Detalles</Button> },
  ]

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1>Control General de Flota Fluvial</h1>
          <p>Listado completo de embarcaciones registradas en la plataforma a nivel global.</p>
        </div>
      </div>
      <div className={styles.filters}>
        <Dropdown caps placeholder="Filtrar por Propietario..." value={ownerId} onChange={(e) => setOwnerId(e.target.value)} options={owners.map((o) => ({ value: o.id, label: o.name }))} />
        <Dropdown caps value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Estado: Todos" options={STATUS_OPTIONS} />
        <OwnerSearch value={query} onChange={setQuery} />
      </div>
      <div className={styles.tableCard}>
        {error ? <p role="alert" style={{ padding: 32 }}>{error.message}</p> : isPending ? <p style={{ padding: 32 }}>Cargando…</p> : <DataTable columns={columns} rows={rows} emptyMessage="Ninguna embarcación coincide con los filtros." />}
      </div>
    </>
  )
}
