import { Button, Modal } from '@/components/ui'

const ICONS = { danger: '✕', warning: '!' }

/** Diálogo de confirmación centrado (eliminar, mantenimiento, descartar…). */
export function ConfirmDialog({ open, onClose, onConfirm, tone = 'danger', title, children, cancelLabel = 'Cancelar', confirmLabel = 'Sí, continuar', loading = false }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="alert"
      tone={tone === 'danger' ? 'danger' : 'default'}
      title={title}
      icon={<span style={{ fontWeight: 700, fontSize: 18, color: 'var(--seashare-color-brand-accent)' }}>{ICONS[tone]}</span>}
      footer={
        <>
          <Button variant="soft" square onClick={onClose}>{cancelLabel}</Button>
          <Button variant="danger" square onClick={onConfirm} disabled={loading}>{confirmLabel}</Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}
