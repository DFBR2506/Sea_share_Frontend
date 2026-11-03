import { useState } from 'react'
import { Button, Modal, Textarea } from '@/components/ui'
import styles from '../pages/owner.module.css'

const REASONS = [
  { value: 'FUERZA_MAYOR', title: 'Fuerza mayor logística', text: 'Imprevisto operativo del anfitrión (agenda, permisos, tripulación, etc.), la embarcación no tuvo ningún daño.', effect: 'La embarcación quedará Disponible', ok: true },
  { value: 'AVERIA', title: 'Avería o desperfecto mecánico', text: 'La embarcación presenta una falla que impide operar con seguridad y requiere revisión.', effect: 'La embarcación pasará a En mantenimiento / Limpieza', ok: false },
]

export function HostCancelModal({ open, onClose, onConfirm, reservation, boatName, loading }) {
  const [reason, setReason] = useState('')
  const [justification, setJustification] = useState('')
  const [touched, setTouched] = useState(false)

  const submit = () => {
    setTouched(true)
    if (reason) onConfirm({ reason, justification: justification.trim() })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Cancelar Reserva #${reservation.id}`}
      subtitle={`${boatName} · ${reservation.dates} · Arrendatario: ${reservation.guest}`}
      footer={<><Button variant="secondary" onClick={onClose}>Mantener reserva</Button><Button variant="danger" onClick={submit} disabled={loading}>Confirmar cancelación</Button></>}
    >
      <h3 className={styles.sectionH}>Motivo de la cancelación</h3>
      <div className={styles.reasons} role="radiogroup" aria-label="Motivo de la cancelación">
        {REASONS.map((r) => (
          <label key={r.value} className={styles.reason}>
            <input type="radio" name="reason" value={r.value} checked={reason === r.value} onChange={() => setReason(r.value)} />
            <strong>{r.title}</strong>
            <p>{r.text}</p>
            <span className={`${styles.effect} ${r.ok ? styles.effectOk : styles.effectBad}`}>{r.effect}</span>
          </label>
        ))}
      </div>
      {touched && !reason && <span role="alert" style={{ color: 'var(--seashare-color-brand-accent)', fontSize: 12 }}>Selecciona un motivo para continuar</span>}
      <h3 className={styles.sectionH}>Justificación</h3>
      <Textarea placeholder="Describa brevemente lo ocurrido (quedará registrado en el evento cancelación)" value={justification} onChange={(e) => setJustification(e.target.value)} />
    </Modal>
  )
}
