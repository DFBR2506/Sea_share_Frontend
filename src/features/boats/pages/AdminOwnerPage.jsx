import { useParams } from 'react-router-dom'
import { InfoTile } from '@/components/cards'
import { BackButton, PageCard } from '@/components/layout'
import { useOwner } from '../hooks'
import styles from './pages.module.css'

const initials = (name) => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase()

export default function AdminOwnerPage() {
  const { ownerId } = useParams()
  const { data: owner, isPending, error } = useOwner(ownerId)
  if (isPending) return <p>Cargando…</p>
  if (error && error.status !== 404) return <PageCard><p role="alert">{error.message}</p></PageCard>
  if (!owner) return <PageCard><p>No encontramos este propietario.</p></PageCard>

  return (
    <>
      <BackButton to="/admin" />
      <PageCard maxWidth={800}>
        <div className={styles.ownerHead}>
          <div className={styles.ownerWho}>
            <span className={styles.bigAvatar}>{initials(owner.name)}</span>
            <div><h1>{owner.name}</h1><p>Propietario de Flota Fluvial</p></div>
          </div>
        </div>
        <div className={styles.two}>
          <InfoTile label="Correo electrónico" value={owner.email} />
          <InfoTile label="Teléfono de contacto" value={owner.phone} />
          <InfoTile label="Documento de identidad" value={owner.document} />
        </div>
      </PageCard>
    </>
  )
}
