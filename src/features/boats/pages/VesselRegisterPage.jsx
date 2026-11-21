import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackButton, PageCard, PageCardHead } from '@/components/layout'
import { ConfirmDialog } from '@/components/modals'
import { AnimatedStepper, Button, Checkbox, Chip, Dropdown, Input, StepContent, useStepDirection } from '@/components/ui'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { MANDATORY_SERVICES, SERVICE_OPTIONS } from '../constants'
import { useBoatTypes, useCompleteRegistration, useCreateDraft, useDeleteDraft, useDraft } from '../hooks'
import styles from './pages.module.css'

const STEPS = [{ label: 'Datos Básicos' }, { label: 'Datos Complementarios' }]

function RegisterForm({ existingDraft }) {
  const navigate = useNavigate()
  const { data: types = [] } = useBoatTypes()
  const createDraft = useCreateDraft()
  const complete = useCompleteRegistration()
  const discardDraft = useDeleteDraft()
  const [draftId, setDraftId] = useState(existingDraft?.id ?? null)
  const [step, setStep] = useState(1)
  const direction = useStepDirection(step)
  const [touched, setTouched] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [form, setForm] = useState({ name: existingDraft?.name ?? '', plate: existingDraft?.plate ?? '', type: existingDraft?.type ?? '', capacity: existingDraft ? String(existingDraft.capacity) : '', hourlyRate: '', portName: '', lat: '', long: '', extras: [] })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggle = (s) => setForm((f) => ({ ...f, extras: f.extras.includes(s) ? f.extras.filter((x) => x !== s) : [...f.extras, s] }))

  const errors1 = {
    name: !form.name.trim() && 'El nombre es obligatorio',
    plate: !/^CP-\d{2}-\d{4}-[A-Z]$/i.test(form.plate.trim()) && 'Formato esperado: CP-05-1042-A',
    type: !form.type && 'Selecciona un tipo',
    capacity: !(Number(form.capacity) > 0) && 'Ingresa una capacidad válida',
  }
  const errors2 = {
    portName: !form.portName.trim() && 'El puerto es obligatorio',
    lat: form.lat.trim() === '' || !Number.isFinite(Number(form.lat)) ? 'Latitud inválida' : false,
    long: form.long.trim() === '' || !Number.isFinite(Number(form.long)) ? 'Longitud inválida' : false,
    hourlyRate: !(Number(form.hourlyRate) > 0) && 'Ingresa una tarifa válida',
  }
  const draftError = createDraft.error
  const completeError = complete.error
  const server = (field) => (draftError ?? completeError)?.fieldError?.(field)

  const next = () => {
    setTouched(true)
    if (Object.values(errors1).some(Boolean)) return
    const advance = () => { setTouched(false); setStep(2) }
    if (draftId) return advance()
    createDraft.mutate(
      { name: form.name.trim(), plate: form.plate.trim().toUpperCase(), type: form.type, capacity: Number(form.capacity) },
      { onSuccess: (draft) => { setDraftId(draft.id); advance() } },
    )
  }
  const goTo = (index) => {
    if (index + 1 > step) return next()
    setTouched(false)
    setStep(index + 1)
  }
  const save = () => {
    setTouched(true)
    if (Object.values(errors2).some(Boolean)) return
    complete.mutate(
      { id: draftId, data: { hourlyRate: Number(form.hourlyRate), extras: form.extras, port: { name: form.portName.trim(), lat: form.lat.trim(), long: form.long.trim() }, photo } },
      { onSuccess: () => navigate('/owner/embarcaciones') },
    )
  }
  const cancel = () => {
    if (!draftId) return navigate('/owner/embarcaciones')
    discardDraft.mutate(undefined, { onSettled: () => navigate('/owner/embarcaciones') })
  }

  return (
    <>
      <BackButton to="/owner/embarcaciones" />
      <PageCard maxWidth={860}>
        <PageCardHead
          title="Registrar Nueva Embarcación"
          subtitle={step === 1 ? 'Paso 1 de 2: Información general y datos legales del vehículo fluvial.' : 'Paso 2 de 2: Puerto de atraque, tarifa, servicios y fotografía oficial.'}
          actions={<AnimatedStepper className={styles.stepperWrap} steps={STEPS} currentStep={step - 1} onStepChange={goTo} />}
        />

        <StepContent step={step} direction={direction}>
        {step === 1 ? (
          <div className={styles.stack}>
            <Input caps label="Nombre de la embarcación" placeholder="Ej. Río Magdalena II" value={form.name} onChange={set('name')} error={touched && errors1.name || server('name')} disabled={Boolean(draftId)} />
            <Input caps label="Matrícula legal" placeholder="Ej. CP-05-XXXX-A" value={form.plate} onChange={set('plate')} error={touched && errors1.plate || server('legal_registration')} disabled={Boolean(draftId)} />
            <div className={styles.two}>
              <Dropdown caps label="Tipo de embarcación" placeholder="Seleccionar tipo (Lancha, Yate, etc.)" options={types.map((t) => ({ value: t.code, label: t.name }))} value={form.type} onChange={set('type')} error={touched && errors1.type || server('type')} disabled={Boolean(draftId)} />
              <Input caps label="Capacidad máxima (pasajeros)" placeholder="Ej. 10" inputMode="numeric" value={form.capacity} onChange={set('capacity')} error={touched && errors1.capacity || server('max_capacity')} disabled={Boolean(draftId)} />
            </div>
          </div>
        ) : (
          <div className={`${styles.formGrid} ${styles.split}`} style={{ gridTemplateColumns: undefined }}>
            <div className={styles.stack}>
              <div>
                <p className={styles.sectionLabel}>Puerto de atraque (selección en mapa)</p>
                <MapPlaceholder port={{ name: form.portName, lat: form.lat, long: form.long }} />
                <div className={styles.two} style={{ marginTop: 12 }}>
                  <Input caps label="Nombre del puerto" placeholder="Ej. Marina Fluvial Magdalena" value={form.portName} onChange={set('portName')} error={touched && errors2.portName || server('port_name')} />
                  <Input caps label="Latitud" placeholder="Ej. 10.7452" inputMode="decimal" value={form.lat} onChange={set('lat')} error={touched && errors2.lat || server('coordinates')} />
                  <Input caps label="Longitud" placeholder="Ej. -74.7891" inputMode="decimal" value={form.long} onChange={set('long')} error={touched && errors2.long} />
                </div>
              </div>
              <Input caps label="Tarifa base (por hora en COP)" placeholder="Ej. 180000" inputMode="numeric" value={form.hourlyRate} onChange={set('hourlyRate')} error={touched && errors2.hourlyRate || server('base_rate')} />
              <div>
                <p className={styles.sectionLabel}>Fotografía oficial</p>
                <label className={styles.drop}>
                  + Adjuntar imagen de la embarcación
                  <small>{photo?.name || 'PNG, JPG hasta 10MB'}</small>
                  <input type="file" accept="image/png,image/jpeg" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
                </label>
                {server('photo') && <span role="alert" style={{ fontSize: 11 }}>{server('photo')}</span>}
              </div>
            </div>
            <div className={styles.stack}>
              <div>
                <p className={styles.sectionLabel}>Servicios base obligatorios (incluidos)</p>
                <p className={styles.hintText}>Estos servicios vienen predeterminados y no se pueden remover.</p>
                <div className={styles.chips}>{MANDATORY_SERVICES.map((s) => <Chip key={s}>{s} (Obligatorio)</Chip>)}</div>
              </div>
              <div>
                <p className={styles.sectionLabel}>Seleccionar servicios adicionales</p>
                <div className={styles.stack} style={{ gap: 14 }}>
                  {SERVICE_OPTIONS.map((s) => <Checkbox key={s} label={s} checked={form.extras.includes(s)} onChange={() => toggle(s)} />)}
                </div>
              </div>
            </div>
          </div>
        )}
        </StepContent>

        {(draftError ?? completeError) && <p role="alert" style={{ fontSize: 12, color: 'var(--seashare-color-brand-accent)' }}>{(draftError ?? completeError).message}</p>}
        <div className={styles.footerBar}>
          <Button variant="soft" square onClick={() => setCancelling(true)}>Cancelar</Button>
          {step === 2 && <Button variant="outline" square onClick={() => { setTouched(false); setStep(1) }}>Atrás</Button>}
          {step === 1 ? <Button square onClick={next} disabled={createDraft.isPending}>Siguiente →</Button> : <Button square onClick={save} disabled={complete.isPending}>Guardar Registro</Button>}
        </div>
      </PageCard>

      <ConfirmDialog
        open={cancelling}
        onClose={() => setCancelling(false)}
        tone="warning"
        title="¿Cancelar registro?"
        cancelLabel="Seguir registrando"
        confirmLabel="Cancelar"
        onConfirm={cancel}
      >
        <span style={{ fontSize: 12 }}>Perderás los datos ingresados hasta ahora.</span>
      </ConfirmDialog>
    </>
  )
}

// Si quedó un borrador del paso 1, se retoma en lugar de crear otro.
export default function VesselRegisterPage() {
  const { data: draft, isPending } = useDraft()
  if (isPending) return <p>Cargando…</p>
  return <RegisterForm existingDraft={draft ?? undefined} />
}
