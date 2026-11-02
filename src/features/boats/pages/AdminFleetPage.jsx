import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, DataTable, Dropdown, SearchBar, StatusPill } from '@/components/ui'
import { STATUS_UI } from '../api/mocks'
import { useAllVessels, useOwners } from '../hooks'
import styles from './pages.module.css'

export default function AdminFleetPage() {
  const navigate = useNavigate()
  const { data: vessels = [], isPending } = useAllVessels()
  const { data: owners = [] } = useOwners()
  const [ownerId, setOwnerId] = useState('')
  const [status, setStatus] = useState('')
  const [query, setQuery] = useState('')

  const q = query.trim().toLowerCase()
  const rows = vessels.filter((v) =>
    (!ownerId || v.ownerId === ownerId) &&
    (!status || v.status === status) &&
    (!q || v.owner.name.toLowerCase().includes(q) || v.owner.document.includes(q)),
  )

  const columns = [
    { key: 'name', header: 'Embarcación', render: (v) => <span style={{ fontWeight: 700, fontSize: 13 }}>{v.name}</span> },
    { key: 'owner', header: 'Propietario', render: (v) => <button type="button" className={styles.link} onClick={() => navigate(`/admin/propietarios/${v.ownerId}`)}>{v.owner.name}</button> },
    { key: 'plate', header: 'Matrícula' },
    { key: 'type', header: 'Tipo' },
    { key: 'status', header: 'Estado operativo', render: (v) => <StatusPill tone={STATUS_UI[v.status].tone}>{STATUS_UI[v.status].label}</StatusPill> },
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
        <Dropdown caps value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Estado: Todos" options={[{ value: 'DISPONIBLE', label: 'Disponible' }, { value: 'MANTENIMIENTO', label: 'En Mantenimiento' }]} />
        <SearchBar value={query} onChange={setQuery} placeholder="Buscar propietario por nombre o cédula…" />
      </div>
      <div className={styles.tableCard}>
        {isPending ? <p style={{ padding: 32 }}>Cargando…</p> : <DataTable columns={columns} rows={rows} emptyMessage="Ninguna embarcación coincide con los filtros." />}
      </div>
    </>
  )
}
