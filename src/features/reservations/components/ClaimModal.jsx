import { useState } from 'react'
import { Button, Modal, Textarea } from '@/components/ui'

export function ClaimModal({ open, onClose, onSubmit, loading, error, response }) {
  const [text, setText] = useState('')
  const [touched, setTouched] = useState(false)
  const submit = () => {
    setTouched(true)
    if (!loading && !response && text.trim().length >= 10 && text.trim().length <= 2000) onSubmit(text.trim())
  }
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title="Reportar reclamo"
      subtitle="Un administrador revisará tu reporte y decidirá sobre el depósito."
      footer={<><Button variant="secondary" disabled={loading} onClick={onClose}>{response ? 'Cerrar' : 'Cancelar'}</Button>{!response && <Button onClick={submit} disabled={loading}>Enviar reclamo</Button>}</>}
    >
      {!response && <Textarea label="Describe lo ocurrido" placeholder="Ej. El timón llegó dañado…" maxLength={2000} disabled={loading} value={text} onChange={(e) => setText(e.target.value)} error={touched && text.trim().length < 10 && 'Escribe al menos 10 caracteres'} />}
      {error && <p role="alert">{error.message}</p>}
      {response && <div role="status">
        <p>{response.message}</p>
        <p>{response.status} · {response.claim?.registered_at ?? '—'}</p>
        <p>{response.claim?.description ?? '—'}</p>
      </div>}
    </Modal>
  )
}
