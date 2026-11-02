import disputeIcon from '@/assets/icons/dispute.svg'
import { Button, Modal, Textarea } from '@/components/ui'
import styles from './Modals.module.css'

export function DisputeResolutionModal({ open, onClose, onConfirm, disputeCode, claim, note, onNoteChange, loading = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      tone="danger"
      title="Resolver disputa"
      subtitle="La decisión se notificará a ambas partes."
      icon={<img src={disputeIcon} alt="" className={styles.icon} />}
      footer={
        <>
          <Button onClick={onClose}>Cancelar</Button>
          <Button variant="danger" onClick={onConfirm} disabled={loading}>Confirmar</Button>
        </>
      }
    >
      <p className={styles.title}>Disputa {disputeCode}</p>
      <p className={styles.muted}>{claim}</p>
      <Textarea
        label="Motivo de la resolución"
        placeholder="Escribe una nota opcional…"
        value={note}
        onChange={(e) => onNoteChange?.(e.target.value)}
      />
    </Modal>
  )
}
