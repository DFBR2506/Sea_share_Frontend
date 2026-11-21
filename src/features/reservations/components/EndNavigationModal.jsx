import { useState } from 'react'
import { Button, Modal, Textarea } from '@/components/ui'

export function EndNavigationModal({ open, onClose, onConfirm, loading, error }) {
  const [remarks, setRemarks] = useState('')
  return <Modal open={open} onClose={loading ? undefined : onClose} title="Finalizar navegación"
    subtitle="Se abrirá automáticamente la ventana de garantía de 24 horas."
    footer={<>
      <Button variant="secondary" disabled={loading} onClick={onClose}>Volver</Button>
      <Button disabled={loading} onClick={() => onConfirm(remarks)}>Finalizar viaje</Button>
    </>}>
    <Textarea label="Novedades al cierre (opcional)" maxLength={2000} disabled={loading} value={remarks} onChange={(event) => setRemarks(event.target.value)} />
    <p>Estas novedades no son un reclamo formal. Después del cierre podrás reportar un reclamo sobre la garantía.</p>
    {error && <p role="alert">{error.message}</p>}
  </Modal>
}
