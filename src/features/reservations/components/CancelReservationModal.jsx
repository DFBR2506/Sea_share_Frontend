import { useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button, Modal } from '@/components/ui'
import { cancelReservation } from '../api'
import { getReservationStatusUI } from '../api/statusMap'
import styles from '../pages/pages.module.css'

export function CancelReservationModal({ open, onClose, onConfirm, reservation, boatName }) {
  const pending = useRef(false)
  const cancellation = useMutation({ mutationFn: () => cancelReservation(reservation.id), onSuccess: onConfirm })
  const response = cancellation.data
  const confirm = () => {
    if (pending.current || cancellation.isSuccess) return
    pending.current = true
    cancellation.mutate(undefined, { onSettled: () => { pending.current = false } })
  }
  return (
    <Modal
      open={open}
      onClose={cancellation.isPending ? undefined : onClose}
      size="lg"
      title={`Cancelar Reserva #${reservation.id}`}
      subtitle={`${boatName} · ${reservation.dates} · ${reservation.guest}`}
      footer={
        <>
          <Button variant="secondary" disabled={cancellation.isPending} onClick={onClose}>{response ? 'Cerrar' : 'Mantener reserva'}</Button>
          {!response && <Button disabled={cancellation.isPending} onClick={confirm}>Confirmar cancelación</Button>}
        </>
      }
    >
      {cancellation.error && <p role="alert">{cancellation.error.message}</p>}
      {!response && <div className={styles.cancelBox}>
        <div className={styles.line}><span>Zarpe pactado</span><span>{reservation.embark}</span></div>
      </div>}
      {response && <div className={styles.cancelBox}>
        <p role="status">{response.message}</p>
        <div className={styles.line}><span>Estado</span><span>{getReservationStatusUI(response.status).label}</span></div>
        <div className={styles.line}><span>Clasificación</span><span>{response.cancellation_subtype}</span></div>
        {response.anticipation_hours != null && <div className={styles.line}><span>Anticipación (horas)</span><span>{response.anticipation_hours}</span></div>}
        <div className={styles.line}><span>Zona horaria del puerto</span><span>{response.port_timezone}</span></div>
        <div className={styles.line}><span>Zarpe pactado</span><span>{response.scheduled_departure}</span></div>
        <div className={styles.line}><span>Solicitud de cancelación</span><span>{response.cancelled_at}</span></div>
      </div>}
    </Modal>
  )
}
