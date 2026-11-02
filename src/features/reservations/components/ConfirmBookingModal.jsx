import { useState } from 'react'
import { Button, Input, Modal } from '@/components/ui'
import { money } from '@/lib/dates'
import styles from '../pages/pages.module.css'

/** Modal "Confirma los datos de tu reserva": resumen + datos de contacto del titular. */
export function ConfirmBookingModal({ open, onClose, onContinue, boat, rangeLabel, nights, pax, base }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' })
  const [touched, setTouched] = useState(false)
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const errors = { name: !form.name.trim() && 'Campo requerido', phone: !form.phone.trim() && 'Campo requerido' }

  const submit = () => {
    setTouched(true)
    if (!errors.name && !errors.phone) onContinue(form)
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title="CONFIRMA LOS DATOS DE TU RESERVA"
      footer={<Button block onClick={submit} variant="secondary">Continuar a pagar</Button>}
    >
      <div className={styles.summary}>
        <div className={styles.thumb} />
        <div>
          <strong>{boat.name}</strong>
          <p className={styles.muted}>{boat.location}</p>
          <p className={styles.muted}>{rangeLabel} · {nights} noches · {pax} {pax === 1 ? 'pasajero' : 'pasajeros'}</p>
        </div>
      </div>
      <div className={styles.rowBetween}>
        <span>Tarifa base · ${boat.pricePerDay} × {nights} noches</span>
        <strong>{money(base).replace('.00', '')}</strong>
      </div>
      <div className={styles.notice}>Al continuar, tu reserva queda <strong>Iniciada</strong> y arranca tu ventana de 15 minutos.</div>
      <strong>Datos de contacto del titular</strong>
      <Input label="Nombre completo del titular *" placeholder="Ej. María Fernanda Rojas" value={form.name} onChange={set('name')} error={touched && errors.name} />
      <div className={styles.formRow}>
        <Input label="Celular de contacto *" placeholder="Ej. 300 123 4567" inputMode="tel" value={form.phone} onChange={set('phone')} error={touched && errors.phone} />
        <Input label="Correo electrónico" placeholder="Ej. maria@correo.com" type="email" value={form.email} onChange={set('email')} />
      </div>
    </Modal>
  )
}
