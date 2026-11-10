import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackButton, PageCard, PageCardHead } from '@/components/layout'
import { ConfirmDialog } from '@/components/modals'
import { AnimatedStepper, Button, Checkbox, Chip, Dropdown, Input, StepContent, useStepDirection } from '@/components/ui'
import { MapPlaceholder } from '../components/MapPlaceholder'
import { BOAT_TYPES, MANDATORY_SERVICES, SERVICE_OPTIONS } from '../api/mocks'
import { useCreateVessel } from '../hooks'
import styles from './pages.module.css'

const DEFAULT_PORT = { name: 'Marina Fluvial Magdalena (Muelle Principal)', lat: '10.7452° N', long: '74.7891° O' }

const STEPS = [{ label: 'Datos Básicos' }, { label: 'Datos Complementarios' }]

export default function VesselRegisterPage() {
  const navigate = useNavigate()
  const create = useCreateVessel()
  const [step, setStep] = useState(1)
  const direction = useStepDirection(step)
  const [touched, setTouched] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [fileName, setFileName] = useState('')
  const [form, setForm] = useState({ name: '', plate: '', type: '', capacity: '', hourlyRate: '', extras: [] })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const toggle = (s) => setForm((f) => ({ ...f, extras: f.extras.includes(s) ? f.extras.filter((x) => x !== s) : [...f.extras, s] }))

  const errors1 = {
    name: !form.name.trim() && 'El nombre es obligatorio',
    plate: !/^CP-\d{2}-\d{4}-[A-Z]$/i.test(form.plate.trim()) && 'Formato esperado: CP-05-1042-A',
    type: !form.type && 'Selecciona un tipo',
    capacity: !(Number(form.capacity) > 0) && 'Ingresa una capacidad válida',
  }
  const errors2 = { hourlyRate: !(Number(form.hourlyRate) > 0) && 'Ingresa una tarifa válida' }

  const next = () => {
    setTouched(true)
    if (Object.values(errors1).some(Boolean)) return
    setTouched(false)
    setStep(2)
  }
  const goTo = (index) => {
    if (index + 1 > step) return next()
    setTouched(false)
    setStep(index + 1)
  }
  const save = () => {
    setTouched(true)
    if (Object.values(errors2).some(Boolean)) return
    create.mutate(
      { name: form.name.trim(), plate: form.plate.trim().toUpperCase(), type: form.type, capacity: Number(form.capacity), hourlyRate: Number(form.hourlyRate), extras: form.extras, port: DEFAULT_PORT },
      { onSuccess: () => navigate('/owner/embarcaciones') },
    )
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
            <Input caps label="Nombre de la embarcación" placeholder="Ej. Río Magdalena II" value={form.name} onChange={set('name')} error={touched && errors1.name} />
            <Input caps label="Matrícula legal" placeholder="Ej. CP-05-XXXX-A" value={form.plate} onChange={set('plate')} error={touched && errors1.plate} />
            <div className={styles.two}>
              <Dropdown caps label="Tipo de embarcación" placeholder="Seleccionar tipo (Lancha, Yate, etc.)" options={BOAT_TYPES.map((t) => ({ value: t, label: t }))} value={form.type} onChange={set('type')} error={touched && errors1.type} />
              <Input caps label="Capacidad máxima (pasajeros)" placeholder="Ej. 10" inputMode="numeric" value={form.capacity} onChange={set('capacity')} error={touched && errors1.capacity} />
            </div>
          </div>
        ) : (
          <div className={`${styles.formGrid} ${styles.split}`} style={{ gridTemplateColumns: undefined }}>
            <div className={styles.stack}>
              <div>
                <p className={styles.sectionLabel}>Puerto de atraque (selección en mapa)</p>
                <MapPlaceholder port={DEFAULT_PORT} />
              </div>
              <Input caps label="Tarifa base (por hora en COP)" placeholder="Ej. 180000" inputMode="numeric" value={form.hourlyRate} onChange={set('hourlyRate')} error={touched && errors2.hourlyRate} />
              <div>
                <p className={styles.sectionLabel}>Fotografía oficial</p>
                <label className={styles.drop}>
                  + Adjuntar imagen de la embarcación
                  <small>{fileName || 'PNG, JPG hasta 10MB'}</small>
                  <input type="file" accept="image/png,image/jpeg" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')} />
                </label>
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

        <div className={styles.footerBar}>
          <Button variant="soft" square onClick={() => setCancelling(true)}>Cancelar</Button>
          {step === 2 && <Button variant="outline" square onClick={() => { setTouched(false); setStep(1) }}>Atrás</Button>}
          {step === 1 ? <Button square onClick={next}>Siguiente →</Button> : <Button square onClick={save} disabled={create.isPending}>Guardar Registro</Button>}
        </div>
      </PageCard>

      <ConfirmDialog
        open={cancelling}
        onClose={() => setCancelling(false)}
        tone="warning"
        title="¿Cancelar registro?"
        cancelLabel="Seguir registrando"
        confirmLabel="Cancelar"
        onConfirm={() => navigate('/owner/embarcaciones')}
      >
        <span style={{ fontSize: 12 }}>Perderás los datos ingresados hasta ahora.</span>
      </ConfirmDialog>
    </>
  )
}
