import { useState } from 'react'
import { Button, Modal, Textarea } from '@/components/ui'

export function ClaimModal({ open, onClose, onSubmit, loading }) {
  const [text, setText] = useState('')
  const [touched, setTouched] = useState(false)
  const submit = () => {
    setTouched(true)
    if (text.trim().length >= 10) onSubmit(text.trim())
  }
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Reportar reclamo"
      subtitle="Un administrador revisará tu reporte y decidirá sobre el depósito."
      footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={submit} disabled={loading}>Enviar reclamo</Button></>}
    >
      <Textarea label="Describe lo ocurrido" placeholder="Ej. El timón llegó dañado…" value={text} onChange={(e) => setText(e.target.value)} error={touched && text.trim().length < 10 && 'Escribe al menos 10 caracteres'} />
    </Modal>
  )
}
