import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, DataTable, Pagination, SlideButton, StatusPill } from '@/components/ui'
import plusIcon from '@/assets/icons/plus.svg'
import { STATUS_UI } from '../api/mocks'
import { useOwnerVessels } from '../hooks'
import styles from './pages.module.css'

const PAGE_SIZE = 5

export default function OwnerVesselsPage() {
  const navigate = useNavigate()
  const { data: vessels = [], isPending } = useOwnerVessels()
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(vessels.length / PAGE_SIZE)
  const visible = vessels.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const columns = [
    { key: 'name', header: 'Nombre de la embarcación', render: (v) => <><span style={{ fontWeight: 700, fontSize: 13 }}>{v.name}</span>{v.isNew && <span className={styles.newTag}>NUEVA</span>}</> },
    { key: 'plate', header: 'Matrícula' },
    { key: 'type', header: 'Tipo' },
    { key: 'status', header: 'Estado operativo', render: (v) => <StatusPill tone={STATUS_UI[v.status].tone}>{STATUS_UI[v.status].label}</StatusPill> },
    { key: 'actions', header: 'Acciones', render: (v) => <Button variant="outline" square onClick={() => navigate(`/owner/embarcaciones/${v.id}`)}>Ver Detalles</Button> },
  ]

  return (
    <>
      <div className={styles.header}>
        <div>
          <h1>Mis Embarcaciones Registradas</h1>
          <p>Gestiona el estado operativo y consulta los detalles de tus vehículos fluviales.</p>
        </div>
        <SlideButton icon={plusIcon} onClick={() => navigate('/owner/embarcaciones/nueva')}>Registrar Nueva Embarcación</SlideButton>
      </div>
      <div className={styles.tableCard}>
        {isPending ? <p style={{ padding: 32 }}>Cargando…</p> : <DataTable columns={columns} rows={visible} emptyMessage="Aún no tienes embarcaciones registradas." />}
      </div>
      {!isPending && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} total={vessels.length} pageSize={PAGE_SIZE} noun="embarcaciones" />}
    </>
  )
}
