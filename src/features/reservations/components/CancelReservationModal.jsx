import { Button, Modal } from '@/components/ui'
import styles from '../pages/pages.module.css'

/** Muestra la anticipación calculada y la clasificación de la política (valores mock). */
export function CancelReservationModal({ open, onClose, onConfirm, reservation, boatName }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={`Cancelar Reserva #${reservation.id}`}
      subtitle={`${boatName} · ${reservation.dates} sep. 2026 · ${reservation.guest}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Mantener reserva</Button>
          <Button onClick={onConfirm}>Confirmar cancelación</Button>
        </>
      }
    >
      <div className={styles.cancelBox}>
        <div className={styles.line}><span>Zarpe pactado</span><span>{reservation.embark} (hora Miami)</span></div>
        <div className={styles.line}><span>Solicitud de cancelación</span><span>23 sep, 22:00 (hora Miami)</span></div>
        <div className={styles.line}><span>Anticipación calculada</span><span>40 horas</span></div>
      </div>
      <div className={styles.policy}>
        <header><span>ESTADO DE LA POLÍTICA</span><span className={styles.tag}>MODERADO</span></header>
        <span className={styles.muted}>Tu cancelación ha sido clasificada como:</span>
        <strong>MODERADA</strong>
      </div>
      <p className={styles.muted}>El monto de retención lo calcula el sistema de pagos.</p>
    </Modal>
  )
}
