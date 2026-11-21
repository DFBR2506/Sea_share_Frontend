import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BackButton, PageCard, PageCardHead } from '@/components/layout'
import { ConfirmDialog } from '@/components/modals'
import { Button, Checkbox, Chip, Input } from '@/components/ui'
import { MapPicker } from '../components/MapPicker'
import { MANDATORY_SERVICES, SERVICE_OPTIONS } from '../constants'
import { formatCoordinate, typeName } from '../format'
import { useUpdateVessel, useVessel } from '../hooks'
import { capacityError, MESSAGES, nameError, normalizeName, portNameError, rateError } from '../validation'
import { usePhotoUpload } from '../usePhotoUpload'
import { photoSaveMessage } from '../photoUpload'
import styles from './pages.module.css'

const pointOf = (port) => {
  const lat = Number(port.lat)
  const long = Number(port.long)
  return Number.isFinite(lat) && Number.isFinite(long) && port.lat !== '' ? { lat, long } : null
}

function EditForm({ vessel }) {
  const navigate = useNavigate()
  const update = useUpdateVessel()
  const back = `/owner/embarcaciones/${vessel.id}`
  const [form, setForm] = useState({
    name: vessel.name,
    capacity: String(vessel.capacity),
    hourlyRate: String(Number(vessel.hourlyRate)),
    portName: vessel.port.name,
    point: pointOf(vessel.port),
    extras: vessel.extras,
  })
  const { photo, photoProblem, photoBusy, photoPreview, pickPhoto } = usePhotoUpload()
  const [touched, setTouched] = useState(false)
  const [discarding, setDiscarding] = useState(false)

  // En la edición los campos vacíos avisan con el texto corto: no hay un registro que "continuar".
  const required = { requiredMessage: MESSAGES.editRequired }
  const errors = {
    name: nameError(form.name, required),
    capacity: capacityError(form.capacity, required),
    hourlyRate: rateError(form.hourlyRate, required),
    portName: portNameError(form.portName, required),
    point: form.point ? null : MESSAGES.coordinatesRequired,
    photo: photoProblem,
  }
  const server = (field) => update.error?.fieldError?.(field)
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const toggle = (s) => setForm((f) => ({ ...f, extras: f.extras.includes(s) ? f.extras.filter((x) => x !== s) : [...f.extras, s] }))
  const show = (key) => (touched && errors[key]) || undefined

  const save = () => {
    if (photoBusy || update.isPending) return
    setTouched(true)
    if (Object.values(errors).some(Boolean)) return
    update.mutate(
      {
        id: vessel.id,
        changes: {
          name: normalizeName(form.name),
          capacity: Number(form.capacity),
          hourlyRate: Number(form.hourlyRate),
          extras: form.extras,
          port: { name: normalizeName(form.portName), lat: String(form.point.lat), long: String(form.point.long) },
          photo,
        },
      },
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
            <label className={styles.photoBox} style={photoPreview || vessel.photoUrl ? { backgroundImage: `url(${photoPreview || vessel.photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
              <span className={styles.photoBtn}>{photoBusy ? 'Preparando fotografía…' : photo ? photo.name : 'Cambiar fotografía'}</span>
              <input type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" hidden disabled={update.isPending} onChange={(e) => { update.reset(); pickPhoto(e.target.files?.[0] ?? null) }} />
            </label>
            {(photoProblem || server('photo')) && <span role="alert" className={styles.fieldError}>{photoProblem || server('photo')}</span>}
            <div className={styles.lockedWrap}>
              <Input caps label="Matrícula legal (bloqueada)" value={vessel.plate} disabled readOnly />
              <Input caps label="Tipo de embarcación (bloqueado)" value={typeName(vessel.type)} disabled readOnly />
            </div>
          </div>
          <div className={styles.stack}>
            <Input caps label="Nombre de la embarcación" maxLength={50} value={form.name} onChange={set('name')} error={show('name') || server('name')} />
            <div className={styles.two}>
              <Input caps label="Capacidad máxima (pasajeros)" inputMode="numeric" value={form.capacity} onChange={set('capacity')} error={show('capacity') || server('max_capacity')} />
              <Input caps label="Tarifa base (por día)" inputMode="numeric" value={form.hourlyRate} onChange={set('hourlyRate')} error={show('hourlyRate') || server('base_rate')} />
            </div>
            <div>
              <p className={styles.sectionLabel}>Puerto de atraque (selección en mapa interactivo)</p>
              <MapPicker point={form.point} onSelect={(point) => setForm((f) => ({ ...f, point }))} />
              {show('point') && <span role="alert" className={styles.fieldError}>{errors.point}</span>}
              <div className={styles.stack} style={{ marginTop: 12 }}>
                <Input caps label="Nombre del puerto" maxLength={50} value={form.portName} onChange={set('portName')} error={show('portName') || server('port_name')} />
                <div className={styles.two}>
                  <Input caps label="Latitud" value={form.point ? formatCoordinate(form.point.lat) : ''} placeholder="Marca el mapa" readOnly error={server('coordinates')} />
                  <Input caps label="Longitud" value={form.point ? formatCoordinate(form.point.long) : ''} placeholder="Marca el mapa" readOnly />
                </div>
              </div>
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
        {update.error && <p role="alert" className={styles.formError}>{photoSaveMessage(update.error)}</p>}
        <div className={styles.footerBar}>
          <Button variant="soft" square onClick={() => setDiscarding(true)}>Descartar</Button>
          <Button square onClick={save} disabled={update.isPending || photoBusy}>{photoBusy ? 'Preparando imagen…' : update.isPending ? 'Guardando…' : 'Guardar cambios'}</Button>
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
  const { data: vessel, isPending, error } = useVessel(vesselId)
  if (isPending) return <p>Cargando…</p>
  if (error && error.status !== 404) return <PageCard><p role="alert">{error.message}</p></PageCard>
  if (!vessel) return <PageCard><p>No encontramos esta embarcación.</p></PageCard>
  return <EditForm vessel={vessel} />
}
