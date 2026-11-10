import { useState } from 'react'
import { Button, Input } from '@/components/ui'
import { DEPOSIT_NOTE, HIGH_SEASON_WINDOWS } from '../api/mocks'
import { useParams3, useSaveParams } from '../hooks'
import styles from '../components/FinanceUI.module.css'
import local from './params.module.css'

function ParamsForm({ current, savedVersion, onSaved }) {
  const save = useSaveParams()
  const toForm = (p) => ({ commission: String(p.commission), insurance: String(p.insurance), weekend: String(p.weekend), highSeason: String(p.highSeason) })
  const [form, setForm] = useState(toForm(current))
  const [touched, setTouched] = useState(false)
  const [edited, setEdited] = useState(false)
  const saved = savedVersion === current.version && !edited
  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setEdited(true) }

  const pct = (v) => (v === '' || Number.isNaN(Number(v)) || Number(v) < 0 || Number(v) > 100) && 'Ingresa un porcentaje entre 0 y 100'
  const errors = {
    commission: pct(form.commission),
    weekend: pct(form.weekend),
    highSeason: pct(form.highSeason),
    insurance: !(Number(form.insurance) > 0) && 'Ingresa un monto mayor a 0',
  }
  const invalid = Object.values(errors).some(Boolean)

  const submit = () => {
    setTouched(true)
    if (invalid) return
    save.mutate(
      { commission: Number(form.commission), insurance: Number(form.insurance), weekend: Number(form.weekend), highSeason: Number(form.highSeason) },
      { onSuccess: (p) => onSaved(p.version) },
    )
  }
  const reset = () => { setForm(toForm(current)); setTouched(false); setEdited(true) }
  const e = (k) => touched && errors[k]

  return (
    <>
      <section className={`${styles.panel} ${local.card}`}>
        <h2 className={local.h2}>Configuración editable</h2>
        <p className={local.sub}>Los cuatro valores se guardan como una única versión atómica.</p>
        <div className={local.grid}>
          <Input caps label="Comisión de plataforma (%)" inputMode="decimal" value={form.commission} onChange={set('commission')} error={e('commission')} />
          <Input caps label="Seguro náutico por pasajero (COP)" inputMode="numeric" value={form.insurance} onChange={set('insurance')} error={e('insurance')} />
          <Input caps label="Incremento fin de semana (%)" inputMode="decimal" value={form.weekend} onChange={set('weekend')} error={e('weekend')} />
          <Input caps label="Incremento temporada alta (%)" inputMode="decimal" value={form.highSeason} onChange={set('highSeason')} error={e('highSeason')} />
        </div>
        <h2 className={local.h2} style={{ marginTop: 32 }}>Datos calculados · solo lectura</h2>
        <div className={local.grid}>
          <Input caps label="Depósito de garantía" value={DEPOSIT_NOTE} readOnly disabled />
          <Input caps label="Ventanas de temporada alta" value={HIGH_SEASON_WINDOWS} readOnly disabled />
        </div>
      </section>
      <div className={local.actions}>
        {saved && <span className={local.ok} role="status">Versión #{current.version} guardada</span>}
        <Button variant="outline" square onClick={reset}>Cancelar</Button>
        <Button variant="primary" square onClick={submit} disabled={save.isPending}>Guardar cambios</Button>
      </div>
    </>
  )
}

/** Parámetros financieros globales (feature 011). */
export default function FinanceParamsPage() {
  const { data: params, isPending } = useParams3()
  const [savedVersion, setSavedVersion] = useState(null)
  if (isPending) return <p className={styles.empty}>Cargando…</p>
  return (
    <>
      <div className={local.head}>
        <div>
          <p className={styles.eyebrow}>Feature 011</p>
          <h1 className={styles.title}>Parámetros financieros globales</h1>
          <p className={styles.lead}>Configura la versión vigente que utilizan los cálculos financieros de SeaShare.</p>
        </div>
      </div>
      <ParamsForm key={params.version} current={params} savedVersion={savedVersion} onSaved={setSavedVersion} />
    </>
  )
}
