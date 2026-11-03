import searchIcon from '@/assets/icons/search.svg'
import { Button, Modal } from '@/components/ui'
import styles from './Modals.module.css'

export function ConfirmReservationModal({ open, onClose, onConfirm, boatName, summary, total, loading = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirmar reserva"
      subtitle="Revisa los detalles antes de continuar."
      icon={<img src={searchIcon} alt="" className={styles.icon} />}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={onConfirm} disabled={loading}>Confirmar</Button>
        </>
      }
    >
      <p className={styles.title}>{boatName}</p>
      <p className={styles.muted}>{summary}</p>
      <div className={styles.total}><span>Total a pagar</span><span>{total}</span></div>
    </Modal>
  )
}
