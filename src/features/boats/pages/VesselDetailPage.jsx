import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton, PageCard, PageCardHead } from '@/components/layout'
import { ConfirmDialog } from '@/components/modals'
import { Button, StatusPill } from '@/components/ui'
import { VesselDetailView } from '../components/VesselDetailView'
import { STATUS_UI } from '../api/mocks'
import { useDeleteVessel, useSetMaintenance, useVessel } from '../hooks'

/** Detalle de embarcación. mode = 'owner' (con Editar) | 'admin'. */
export default function VesselDetailPage({ mode }) {
  const { vesselId } = useParams()
  const navigate = useNavigate()
  const { data: vessel, isPending } = useVessel(vesselId)
  const maintenance = useSetMaintenance()
  const remove = useDeleteVessel()
  const [dialog, setDialog] = useState(null) // 'maintenance' | 'delete'

  const base = mode === 'owner' ? '/owner/embarcaciones' : '/admin'
  if (isPending) return <p>Cargando…</p>
  if (!vessel) return <PageCard><p>No encontramos esta embarcación.</p></PageCard>

  const inMaintenance = vessel.status === 'MANTENIMIENTO'
  const ui = STATUS_UI[vessel.status]

  return (
    <>
      <BackButton to={base} />
      <PageCard>
        <PageCardHead
          title={vessel.name}
          badge={<StatusPill tone={ui.tone}>{ui.label}</StatusPill>}
          actions={
            <>
              {mode === 'owner' && <Button variant="outline" square onClick={() => navigate(`${base}/${vessel.id}/editar`)}>Editar</Button>}
              <Button variant="warning" square onClick={() => setDialog('maintenance')}>{inMaintenance ? 'Terminar mantenimiento' : 'Enviar a Mantenimiento'}</Button>
              <Button variant="dangerSoft" square onClick={() => setDialog('delete')}>Eliminar</Button>
            </>
          }
        />
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
        onConfirm={() => maintenance.mutate({ id: vessel.id, on: !inMaintenance }, { onSuccess: () => setDialog(null) })}
      >
        <span style={{ fontSize: 12 }}>
          {inMaintenance ? 'La embarcación volverá a recibir reservas.' : 'La embarcación no recibirá reservas temporalmente.'}
        </span>
      </ConfirmDialog>

      <ConfirmDialog
        open={dialog === 'delete'}
        onClose={() => setDialog(null)}
        title="¿Eliminar embarcación?"
        cancelLabel="Conservar"
        confirmLabel="Sí, eliminar"
        loading={remove.isPending}
        onConfirm={() => remove.mutate(vessel.id, { onSuccess: () => navigate(base, { replace: true }) })}
      >
        <span style={{ fontSize: 12 }}>Esta acción eliminará el registro de forma permanente y liberará su matrícula asociada en el sistema.</span>
        <strong style={{ fontSize: 11, color: 'var(--seashare-color-brand-accent)' }}>Esta acción no se puede deshacer.</strong>
      </ConfirmDialog>
    </>
  )
}
