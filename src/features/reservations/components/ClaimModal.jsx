import { useState } from 'react'
import { Button, Dropdown, Modal, Textarea } from '@/components/ui'
import { DAMAGE_CATEGORIES, disputeDate, evidenceLinks, isEvidenceUrl } from '../disputes'

export function ClaimModal({ open, onClose, onSubmit, loading, error, response }) {
  const [text, setText] = useState('')
  const [touched, setTouched] = useState(false)
  const [category, setCategory] = useState('')
  const [evidence, setEvidence] = useState('')
  const urls = evidenceLinks(evidence)
  const evidenceError = urls.length > 5 ? 'Añade como máximo 5 enlaces.' : urls.some((url) => !isEvidenceUrl(url)) ? 'Usa enlaces completos http o https, uno por línea.' : ''
  const submit = () => {
    setTouched(true)
    if (!loading && !response && !evidenceError && text.trim().length >= 10 && text.trim().length <= 2000) {
      onSubmit({ description: text.trim(), ...(category ? { damage_category: category } : {}), evidence_urls: urls })
    }
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
      {!response && <>
        <Dropdown label="Categoría del reclamo (opcional)" options={DAMAGE_CATEGORIES} value={category} onChange={(event) => setCategory(event.target.value)} disabled={loading} />
        <Textarea label="Enlaces de evidencia (opcional, máximo 5)" placeholder="https://…" value={evidence} onChange={(event) => setEvidence(event.target.value)} disabled={loading} error={touched && evidenceError} />
        <p>Adjunta enlaces a evidencias ya disponibles, uno por línea. No incluyas datos de tarjeta ni importes.</p>
      </>}
      {error && <p role="alert">{error.message}</p>}
      {response && <div role="status">
        <p>{response.message}</p>
        <p>{response.status} · {disputeDate(response.claim?.registered_at)}</p>
        <p>{response.claim?.description ?? '—'}</p>
      </div>}
    </Modal>
  )
}
