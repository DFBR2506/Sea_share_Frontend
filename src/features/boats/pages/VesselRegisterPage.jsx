import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BackButton, PageCard, PageCardHead } from '@/components/layout'
import { ConfirmDialog } from '@/components/modals'
import { AnimatedStepper, Button, Checkbox, Chip, Dropdown, Input, Modal, StepContent, useStepDirection } from '@/components/ui'
import { MapPicker } from '../components/MapPicker'
import { MANDATORY_SERVICES, SERVICE_OPTIONS } from '../constants'
import { clearProgress, currentUserId, loadProgress, saveProgress } from '../draftProgress'
import { formatCoordinate } from '../format'
import { useBoatTypes, useCheckPlate, useCompleteRegistration, useCreateDraft, useDeleteDraft, useDraft } from '../hooks'
import { capacityError, legalRegistrationError, MESSAGES, nameError, normalizeName, portNameError, rateError } from '../validation'
import { usePhotoUpload } from '../usePhotoUpload'
import { photoSaveMessage } from '../photoUpload'
import styles from './pages.module.css'

const STEPS = [{ label: 'Datos Básicos' }, { label: 'Datos Complementarios' }]
const LIST = '/owner/embarcaciones'

function RegisterForm({ draft }) {
  const navigate = useNavigate()
  const { data: types = [] } = useBoatTypes()
  const createDraft = useCreateDraft()
  const complete = useCompleteRegistration()
  const discardDraft = useDeleteDraft()
  const checkPlate = useCheckPlate()
  const [userId] = useState(currentUserId)
  // El avance del paso 2 se recupera solo si el borrador sigue siendo el mismo.
  const [saved] = useState(() => (draft ? loadProgress(currentUserId(), draft.id) : null))

  const [draftId, setDraftId] = useState(draft?.id ?? null)
  const [step, setStep] = useState(draft ? 2 : 1)
  const direction = useStepDirection(step)
  const [touched, setTouched] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const { photo, photoProblem, photoBusy, photoPreview, pickPhoto } = usePhotoUpload()
  const [plateTaken, setPlateTaken] = useState(false)
  const [form, setForm] = useState({
    name: draft?.name ?? '',
    plate: draft?.plate ?? '',
    type: draft?.type ?? '',
    capacity: draft ? String(draft.capacity) : '',
    hourlyRate: saved?.hourlyRate ?? '',
    portName: saved?.portName ?? '',
    point: saved?.point ?? null,
    extras: saved?.extras ?? [],
  })

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))
  const toggle = (s) => setForm((f) => ({ ...f, extras: f.extras.includes(s) ? f.extras.filter((x) => x !== s) : [...f.extras, s] }))
  const locked = Boolean(draftId) // el paso 1 queda fijo en cuanto existe el borrador

  // Se conserva lo escrito en el paso 2 para devolverlo si el propietario sale y retoma.
  useEffect(() => {
    if (!draftId) return
    saveProgress(userId, draftId, { portName: form.portName, hourlyRate: form.hourlyRate, point: form.point, extras: form.extras })
  }, [userId, draftId, form.portName, form.hourlyRate, form.point, form.extras])

  const maxCapacity = types.find((t) => t.code === form.type)?.maxCapacity ?? null
  const errors1 = {
    name: nameError(form.name),
    plate: legalRegistrationError(form.plate) ?? (plateTaken ? MESSAGES.legalTaken : null),
    type: form.type ? null : MESSAGES.required,
    capacity: capacityError(form.capacity, { maxCapacity }),
  }
  const errors2 = {
    portName: portNameError(form.portName),
    point: form.point ? null : MESSAGES.coordinatesRequired,
    hourlyRate: rateError(form.hourlyRate),
    photo: photoProblem || (photo ? null : MESSAGES.photoRequired),
  }
  const server = (field) => (createDraft.error ?? complete.error)?.fieldError?.(field)
  const show = (key, errors) => (touched && errors[key]) || undefined

  const next = () => {
    setTouched(true)
    if (Object.values(errors1).some(Boolean)) return
    const advance = () => { setTouched(false); setStep(2) }
    if (draftId) return advance()
    const plate = form.plate.trim().toUpperCase()
    // Se avisa de la matrícula repetida antes de crear el borrador, como en el flujo de M1.
    checkPlate.mutate(plate, {
      onSuccess: (available) => {
        if (!available) return setPlateTaken(true)
        createDraft.mutate(
          { name: normalizeName(form.name), plate, type: form.type, capacity: Number(form.capacity) },
          { onSuccess: (created) => { setDraftId(created.id); advance() } },
        )
      },
    })
  }

  const goTo = (index) => {
    if (index + 1 > step) return next()
    setTouched(false)
    setStep(index + 1)
  }

  const save = () => {
    if (photoBusy || complete.isPending) return
    setTouched(true)
    if (Object.values(errors2).some(Boolean)) return
    complete.mutate(
      {
        id: draftId,
        data: {
          hourlyRate: Number(form.hourlyRate),
          extras: form.extras,
          port: { name: normalizeName(form.portName), lat: String(form.point.lat), long: String(form.point.long) },
          photo,
        },
      },
      { onSuccess: () => { clearProgress(userId, draftId); navigate(LIST) } },
    )
  }

  const cancel = () => {
    if (!draftId) return navigate(LIST)
    clearProgress(userId, draftId)
    discardDraft.mutate(undefined, { onSettled: () => navigate(LIST) })
  }

  const busy = createDraft.isPending || checkPlate.isPending
  const requestError = createDraft.error ?? complete.error ?? checkPlate.error

  return (
    <>
      <BackButton to={LIST} />
      <PageCard maxWidth={860}>
        <PageCardHead
          title="Registrar Nueva Embarcación"
          subtitle={step === 1
            ? 'Paso 1 de 2: Información general y datos legales del vehículo fluvial.'
            : 'Paso 2 de 2: Puerto de atraque en el mapa, tarifa, servicios y fotografía oficial.'}
          actions={<AnimatedStepper className={styles.stepperWrap} steps={STEPS} currentStep={step - 1} onStepChange={goTo} />}
        />

        <StepContent step={step} direction={direction}>
        {step === 1 ? (
          <div className={styles.stack}>
            <Input caps label="Nombre de la embarcación" placeholder="Ej. Río Magdalena II" maxLength={50} value={form.name} onChange={set('name')} error={show('name', errors1) || server('name')} disabled={locked} />
            <Input caps label="Matrícula legal" placeholder="Ej. CP-05-1042-A" value={form.plate} onChange={(e) => { setPlateTaken(false); set('plate')(e) }} error={show('plate', errors1) || server('legal_registration')} disabled={locked} />
            <div className={styles.two}>
              <Dropdown caps label="Tipo de embarcación" placeholder="Seleccionar tipo (Lancha, Yate, etc.)" options={types.map((t) => ({ value: t.code, label: t.name }))} value={form.type} onChange={set('type')} error={show('type', errors1) || server('type')} disabled={locked} />
              <Input caps label={maxCapacity ? `Capacidad máxima (hasta ${maxCapacity} pasajeros)` : 'Capacidad máxima (pasajeros)'} placeholder="Ej. 10" inputMode="numeric" value={form.capacity} onChange={set('capacity')} error={show('capacity', errors1) || server('max_capacity')} disabled={locked} />
            </div>
          </div>
        ) : (
          <div className={`${styles.formGrid} ${styles.splitWide}`}>
            <div className={styles.stack}>
              <div>
                <p className={styles.sectionLabel}>Puerto de atraque (selección en mapa)</p>
                <MapPicker point={form.point} onSelect={(point) => setForm((f) => ({ ...f, point }))} />
                {show('point', errors2) && <span role="alert" className={styles.fieldError}>{errors2.point}</span>}
                <div className={styles.stack} style={{ marginTop: 12 }}>
                  <Input caps label="Nombre del puerto" placeholder="Ej. Marina Fluvial Magdalena" maxLength={50} value={form.portName} onChange={set('portName')} error={show('portName', errors2) || server('port_name')} />
                  <div className={styles.two}>
                    <Input caps label="Latitud" value={form.point ? formatCoordinate(form.point.lat) : ''} placeholder="Marca el mapa" readOnly error={server('coordinates')} />
                    <Input caps label="Longitud" value={form.point ? formatCoordinate(form.point.long) : ''} placeholder="Marca el mapa" readOnly />
                  </div>
                </div>
              </div>
              <Input caps label="Tarifa base (por hora en COP)" placeholder="Ej. 180000" inputMode="numeric" value={form.hourlyRate} onChange={set('hourlyRate')} error={show('hourlyRate', errors2) || server('base_rate')} />
              <div>
                <p className={styles.sectionLabel}>Fotografía oficial</p>
                <label className={styles.drop}>
                  + Adjuntar imagen de la embarcación
                  <small>{photoBusy ? 'Preparando fotografía…' : photo?.name || 'PNG, JPG o JPEG hasta 10 MB'}</small>
                  <input type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" disabled={complete.isPending} onChange={(e) => { complete.reset(); pickPhoto(e.target.files?.[0] ?? null) }} />
                </label>
                {photoPreview && <img className={styles.uploadPreview} src={photoPreview} alt="Vista previa de la fotografía seleccionada" />}
                <small>Las fotografías pesadas se optimizan automáticamente antes del envío.</small>
                {(photoProblem || show('photo', errors2) || server('photo')) && (
                  <span role="alert" className={styles.fieldError}>{photoProblem || errors2.photo || server('photo')}</span>
                )}
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

        {requestError && <p role="alert" className={styles.formError}>{photoSaveMessage(requestError)}</p>}
        <div className={styles.footerBar}>
          <Button variant="soft" square onClick={() => setCancelling(true)}>Cancelar</Button>
          {step === 2 && <Button variant="outline" square onClick={() => { setTouched(false); setStep(1) }}>Atrás</Button>}
          {step === 1
            ? <Button square onClick={next} disabled={busy}>{busy ? 'Validando…' : 'Siguiente →'}</Button>
            : <Button square onClick={save} disabled={complete.isPending || photoBusy}>{photoBusy ? 'Preparando imagen…' : complete.isPending ? 'Guardando…' : 'Guardar Registro'}</Button>}
        </div>
      </PageCard>

      <ConfirmDialog
        open={cancelling}
        onClose={() => setCancelling(false)}
        tone="warning"
        title="¿Cancelar registro?"
        cancelLabel="Seguir registrando"
        confirmLabel="Sí, cancelar"
        loading={discardDraft.isPending}
        onConfirm={cancel}
      >
        <span style={{ fontSize: 12 }}>
          {draftId
            ? 'Se eliminará el borrador y perderás los datos ingresados hasta ahora.'
            : 'Perderás los datos ingresados hasta ahora.'}
        </span>
      </ConfirmDialog>
    </>
  )
}

/** Ventana «Borrador detectado»: continuar el registro pendiente o empezar uno nuevo. */
function DraftDecision({ draft, onContinue, onRestart }) {
  const navigate = useNavigate()
  const discardDraft = useDeleteDraft()
  const [confirming, setConfirming] = useState(false)

  const restart = () => discardDraft.mutate(undefined, {
    onSuccess: () => { clearProgress(currentUserId(), draft.id); onRestart() },
  })

  return (
    <>
      <Modal
        open={!confirming}
        onClose={() => navigate(LIST)}
        title="Borrador detectado"
        subtitle="Tienes un registro incompleto guardado."
        icon={<span style={{ fontWeight: 700, fontSize: 18, color: 'var(--seashare-color-brand-primary)' }}>i</span>}
        footer={
          <>
            <Button variant="soft" square onClick={() => setConfirming(true)}>Empezar un registro nuevo</Button>
            <Button square onClick={onContinue}>Continuar registro pendiente</Button>
          </>
        }
      >
        <p className={styles.draftName}>“{draft.name}”</p>
        <span style={{ fontSize: 12 }}>¿Cómo deseas continuar?</span>
      </Modal>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        tone="warning"
        title="¿Iniciar nuevo registro?"
        cancelLabel="Regresar"
        confirmLabel="Sí, eliminar y empezar"
        loading={discardDraft.isPending}
        onConfirm={restart}
      >
        <span style={{ fontSize: 12 }}>
          Si inicias un formulario nuevo, el borrador actual se eliminará de forma permanente y no
          podrás recuperar la información diligenciada.
        </span>
        {discardDraft.error && <span role="alert" className={styles.fieldError}>{discardDraft.error.message}</span>}
      </ConfirmDialog>
    </>
  )
}

// Si quedó un borrador del paso 1 se pregunta antes: retomarlo o descartarlo y empezar de cero.
export default function VesselRegisterPage() {
  const { data: draft, isPending, error, refetch } = useDraft()
  const [decision, setDecision] = useState(null) // null = sin decidir | 'continue' | 'new'

  if (isPending) return <p>Cargando…</p>
  if (error) {
    return (
      <PageCard maxWidth={520}>
        <PageCardHead title="No se pudo cargar el registro pendiente" subtitle="Verifica tu conexión a internet e inténtalo nuevamente." />
        <div className={styles.footerBar}><Button square onClick={() => refetch()}>Reintentar</Button></div>
      </PageCard>
    )
  }
  if (draft && decision === null) {
    return <DraftDecision draft={draft} onContinue={() => setDecision('continue')} onRestart={() => setDecision('new')} />
  }
  return <RegisterForm key={decision ?? 'fresh'} draft={decision === 'new' ? null : (draft ?? null)} />
}
