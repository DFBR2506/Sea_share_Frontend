import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton, PageCard, PageCardHead } from '@/components/layout'
import { ConfirmDialog } from '@/components/modals'
import trashIcon from '@/assets/icons/trash.svg'
import wrenchIcon from '@/assets/icons/wrench.svg'
import { Button, Input, SlideButton, StatusPill, Textarea } from '@/components/ui'
import { VesselDetailView } from '../components/VesselDetailView'
import { STATUS_UI } from '../constants'
import styles from './pages.module.css'
import { useDeleteVessel, useRequestReview, useSetMaintenance, useVessel } from '../hooks'

// Reservada o En Navegación: la embarcación está comprometida y no se edita, elimina ni suspende.
const CHANGEABLE = ['DISPONIBLE', 'MANTENIMIENTO']

// <input type=datetime-local> → ISO-8601 con zona, como pide M1.
const toIso = (local) => (local ? new Date(local).toISOString() : '')
const nowLocal = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)

/** Detalle de embarcación. mode = 'owner' (con Editar) | 'admin'. */
export default function VesselDetailPage({ mode }) {
  const { vesselId } = useParams()
  const navigate = useNavigate()
  const admin = mode === 'admin'
  const { data: vessel, isPending, error } = useVessel(vesselId, { admin })
  const maintenance = useSetMaintenance()
  const review = useRequestReview()
  const remove = useDeleteVessel()
  const [dialog, setDialog] = useState(null) // 'maintenance' | 'delete'
  const [reason, setReason] = useState('')
  const [start, setStart] = useState('')
  const [until, setUntil] = useState('')

  const base = mode === 'owner' ? '/owner/embarcaciones' : '/admin'
  if (isPending) return <p>Cargando…</p>
  if (error && error.status !== 404) return <PageCard><p role="alert">{error.message}</p></PageCard>
  if (!vessel) return <PageCard><p>No encontramos esta embarcación.</p></PageCard>

  const inMaintenance = vessel.status === 'MANTENIMIENTO'
  const ui = STATUS_UI[vessel.status] ?? { label: vessel.status }
  const changeable = CHANGEABLE.includes(vessel.status)
  // El propietario no puede terminar un mantenimiento que inició el administrador: solo pedir revisión.
  const lockedByAdmin = inMaintenance && !admin && vessel.maintenanceBy === 'ADMIN'
  const mutationError = maintenance.error ?? review.error ?? remove.error
  const startMaintenance = () => maintenance.mutate(
    { id: vessel.id, on: true, admin, reason: reason.trim(), start: toIso(start), until: toIso(until) },
    { onSuccess: () => setDialog(null) },
  )

  return (
    <>
      <BackButton to={base} />
      <PageCard>
        <PageCardHead
          title={vessel.name}
          badge={<StatusPill tone={ui.tone}>{ui.label}</StatusPill>}
          actions={
            <>
              {mode === 'owner' && <Button variant="outline" square disabled={!changeable} onClick={() => navigate(`${base}/${vessel.id}/editar`)}>Editar</Button>}
              {lockedByAdmin
                ? <Button variant="outline" square disabled={vessel.reviewRequested || review.isPending} onClick={() => review.mutate(vessel.id)}>{vessel.reviewRequested ? 'Revisión solicitada' : 'Solicitar revisión'}</Button>
                : <SlideButton icon={wrenchIcon} tone="warning" disabled={!changeable} onClick={() => { setReason(''); setStart(nowLocal()); setUntil(''); maintenance.reset(); setDialog('maintenance') }}>{inMaintenance ? 'Terminar mantenimiento' : 'Enviar a Mantenimiento'}</SlideButton>}
              <SlideButton icon={trashIcon} tone="danger" disabled={!changeable} onClick={() => { setReason(''); remove.reset(); setDialog('delete') }}>Eliminar</SlideButton>
            </>
          }
        />
        {!changeable && <p className={styles.actionNote}>La embarcación está {ui.label.toLowerCase()}: no se puede editar, suspender ni eliminar hasta que quede disponible.</p>}
        {mutationError && dialog === null && <p role="alert" className={styles.formError}>{mutationError.message}</p>}
        <VesselDetailView
          vessel={vessel}
          servicesNote={mode === 'owner' ? 'Servicios base obligatorios y equipamiento adicional seleccionado para el alquiler' : 'Servicios base obligatorios y equipamiento adicional configurado por el propietario'}
        />
      </PageCard>

      <ConfirmDialog
        open={dialog === 'maintenance'}
        onClose={() => setDialog(null)}
        tone="warning"
        title={inMaintenance ? '¿Terminar mantenimiento?' : '¿Enviar a Mantenimiento?'}
        cancelLabel="Cancelar"
        confirmLabel={inMaintenance ? 'Sí, terminar' : 'Sí, enviar'}
        loading={maintenance.isPending}
        confirmDisabled={!inMaintenance && (!until || (admin && !reason.trim()))}
        onConfirm={() => inMaintenance ? maintenance.mutate({ id: vessel.id, on: false, admin }, { onSuccess: () => setDialog(null) }) : startMaintenance()}
      >
        <span style={{ fontSize: 12 }}>
          {inMaintenance ? 'La embarcación volverá a recibir reservas.' : 'La embarcación no recibirá reservas temporalmente.'}
        </span>
        {!inMaintenance && (
          <>
            <Input label="Inicio del mantenimiento" type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} />
            <Input label="Fin del mantenimiento" type="datetime-local" value={until} min={start || undefined} onChange={(e) => setUntil(e.target.value)} />
          </>
        )}
        {!inMaintenance && admin && (
          <Textarea
            label="Razón del mantenimiento"
            placeholder="Ej. Revisión del motor, pintura del casco…"
            rows={3}
            maxLength={300}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}
        {maintenance.error && <span role="alert" style={{ fontSize: 12, color: 'var(--seashare-color-brand-accent)' }}>{maintenance.error.message}</span>}
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === 'delete'}
        onClose={() => setDialog(null)}
        title="¿Eliminar embarcación?"
        cancelLabel="Conservar"
        confirmLabel="Sí, eliminar"
        loading={remove.isPending}
        confirmDisabled={admin && !reason.trim()}
        onConfirm={() => remove.mutate({ id: vessel.id, admin, reason: reason.trim() }, { onSuccess: () => navigate(base, { replace: true }) })}
      >
        <span style={{ fontSize: 12 }}>Esta acción eliminará el registro de forma permanente y liberará su matrícula asociada en el sistema.</span>
        <strong style={{ fontSize: 11, color: 'var(--seashare-color-brand-accent)' }}>Esta acción no se puede deshacer.</strong>
        {admin && <Textarea label="Motivo de la eliminación (se le informa al propietario)" rows={3} maxLength={300} value={reason} onChange={(e) => setReason(e.target.value)} />}
        {remove.error && <span role="alert" style={{ fontSize: 12, color: 'var(--seashare-color-brand-accent)' }}>{remove.error.message}</span>}
      </ConfirmDialog>
    </>
  )
}
