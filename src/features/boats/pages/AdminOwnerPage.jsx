import { useParams } from 'react-router-dom'
import { InfoTile } from '@/components/cards'
import { BackButton, PageCard } from '@/components/layout'
import { StatusPill } from '@/components/ui'
import { useOwner } from '../hooks'
import styles from './pages.module.css'

export default function AdminOwnerPage() {
  const { ownerId } = useParams()
  const { data: owner, isPending } = useOwner(ownerId)
  if (isPending) return <p>Cargando…</p>
  if (!owner) return <PageCard><p>No encontramos este propietario.</p></PageCard>

  return (
    <>
      <BackButton to="/admin" />
      <PageCard maxWidth={800}>
        <div className={styles.ownerHead}>
          <div className={styles.ownerWho}>
            <span className={styles.bigAvatar}>{owner.initials}</span>
            <div><h1>{owner.name}</h1><p>Propietario de Flota Fluvial</p></div>
          </div>
          <StatusPill>{owner.status}</StatusPill>
        </div>
        <div className={styles.two}>
          <InfoTile label="Correo electrónico" value={owner.email} />
          <InfoTile label="Teléfono de contacto" value={owner.phone} />
          <InfoTile label="Documento de identidad" value={owner.document} />
          <InfoTile label="Fecha de registro en el sistema" value={owner.registeredAt} />
        </div>
        <div style={{ marginTop: 16 }}><InfoTile label="Estado de cuenta y restricciones" value={owner.restrictions} /></div>
      </PageCard>
    </>
  )
}
