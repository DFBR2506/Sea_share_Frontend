import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton, PageCard, PageCardHead } from '@/components/layout'
import { ConfirmDialog } from '@/components/modals'
import { Button, Checkbox, Chip, Input } from '@/components/ui'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { MANDATORY_SERVICES, SERVICE_OPTIONS } from '../api/mocks'
import { useUpdateVessel, useVessel } from '../hooks'
import styles from './pages.module.css'

function EditForm({ vessel }) {
  const navigate = useNavigate()
  const update = useUpdateVessel()
  const back = `/owner/embarcaciones/${vessel.id}`
  const [form, setForm] = useState({ name: vessel.name, capacity: String(vessel.capacity), hourlyRate: String(vessel.hourlyRate), extras: vessel.extras })
  const [touched, setTouched] = useState(false)
  const [discarding, setDiscarding] = useState(false)

  const errors = {
    name: !form.name.trim() && 'El nombre es obligatorio',
    capacity: !(Number(form.capacity) > 0) && 'Ingresa una capacidad válida',
    hourlyRate: !(Number(form.hourlyRate) > 0) && 'Ingresa una tarifa válida',
  }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggle = (s) => setForm((f) => ({ ...f, extras: f.extras.includes(s) ? f.extras.filter((x) => x !== s) : [...f.extras, s] }))

  const save = () => {
    setTouched(true)
    if (Object.values(errors).some(Boolean)) return
    update.mutate(
      { id: vessel.id, changes: { name: form.name.trim(), capacity: Number(form.capacity), hourlyRate: Number(form.hourlyRate), extras: form.extras } },
      { onSuccess: () => navigate(back) },
    )
  }

  return (
    <>
      <BackButton to={back} />
      <PageCard>
        <PageCardHead title="Editar Información de Embarcación" subtitle="Modifica los campos permitidos incluyendo la ubicación GPS del puerto. Los datos legales se encuentran bloqueados por seguridad." />
        <div className={`${styles.formGrid} ${styles.split}`}>
          <div>
            <p className={styles.sectionLabel}>Fotografía de la embarcación</p>
            <div className={styles.photoBox}><button type="button" className={styles.photoBtn}>Cambiar fotografía</button></div>
            <div className={styles.lockedWrap}>
              <Input caps label="Matrícula legal (bloqueada)" value={vessel.plate} disabled readOnly />
              <Input caps label="Tipo de embarcación (bloqueado)" value={vessel.type} disabled readOnly />
            </div>
          </div>
          <div className={styles.stack}>
            <Input caps label="Nombre de la embarcación" value={form.name} onChange={set('name')} error={touched && errors.name} />
            <div className={styles.two}>
              <Input caps label="Capacidad máxima (pasajeros)" inputMode="numeric" value={form.capacity} onChange={set('capacity')} error={touched && errors.capacity} />
              <Input caps label="Tarifa base (por hora)" inputMode="numeric" value={form.hourlyRate} onChange={set('hourlyRate')} error={touched && errors.hourlyRate} />
            </div>
            <div>
              <p className={styles.sectionLabel}>Puerto de atraque (selección en mapa interactivo)</p>
              <MapPlaceholder port={vessel.port} />
            </div>
            <div>
              <p className={styles.sectionLabel}>Servicios base obligatorios (incluidos)</p>
              <div className={styles.chips}>{MANDATORY_SERVICES.map((s) => <Chip key={s}>{s} (Fijo)</Chip>)}</div>
            </div>
            <div>
              <p className={styles.sectionLabel}>Seleccionar servicios adicionales</p>
              <div className={styles.checks}>
                {SERVICE_OPTIONS.map((s) => <Checkbox key={s} label={s} checked={form.extras.includes(s)} onChange={() => toggle(s)} />)}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.footerBar}>
          <Button variant="soft" square onClick={() => setDiscarding(true)}>Descartar</Button>
          <Button square onClick={save} disabled={update.isPending}>Guardar cambios</Button>
        </div>
      </PageCard>

      <ConfirmDialog
        open={discarding}
        onClose={() => setDiscarding(false)}
        tone="warning"
        title="¿Descartar cambios?"
        cancelLabel="Seguir editando"
        confirmLabel="Sí, descartar"
        onConfirm={() => navigate(back)}
      >
        <span style={{ fontSize: 12 }}>Los cambios que no hayas guardado se perderán.</span>
      </ConfirmDialog>
    </>
  )
}

export default function VesselEditPage() {
  const { vesselId } = useParams()
  const { data: vessel, isPending } = useVessel(vesselId)
  if (isPending) return <p>Cargando…</p>
  if (!vessel) return <PageCard><p>No encontramos esta embarcación.</p></PageCard>
  return <EditForm vessel={vessel} />
}
