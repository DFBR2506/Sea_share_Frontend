import { useRef, useState } from 'react'
import { DisputeResolutionModal } from '@/components/modals'
import { Button, Textarea } from '@/components/ui'
import { useDispute, useDisputes, useResolveDispute } from '../hooks'
import { DAMAGE_CATEGORIES, disputeDate, isEvidenceUrl } from '../disputes'
import base from './pages.module.css'
import styles from './owner.module.css'

const DISPUTE_STATUS = { PENDING: 'PENDIENTE', ACCEPTED: 'ACEPTADO', REJECTED: 'RECHAZADO' }
const isResolved = (status) => status === 'ACCEPTED' || status === 'REJECTED'

export default function AdminDisputesPage() {
  const { data: disputes = [], isPending, error } = useDisputes()
  const resolve = useResolveDispute()
  const [selectedId, setSelectedId] = useState(null)
  const [note, setNote] = useState('')
  const [internalNotes, setInternalNotes] = useState('')
  const [decision, setDecision] = useState(null) // 'accept' | 'reject'
  const pending = useRef(false)

  const selected = disputes.find((d) => d.id === selectedId) ?? disputes.find((d) => !isResolved(d.status)) ?? disputes[0]
  const detail = useDispute(selected?.id)
  const current = detail.data ?? selected

  if (error) return <p role="alert" className={base.state}>{error.message}</p>
  if (isPending) return <p className={base.state}>Cargando…</p>

  const open = disputes.filter((d) => d.status === 'PENDING' && !d.claimData).length
  const review = disputes.filter((d) => d.status === 'PENDING' && d.claimData).length
  const resolved = disputes.filter((d) => isResolved(d.status)).length
  const resolution = resolve.data?.dispute_id === current?.id ? resolve.data : null
  const currentStatus = current ? DISPUTE_STATUS[current.status] ?? current.status ?? '—' : '—'

  const confirm = () => {
    if (!current || !decision || pending.current) return
    setSelectedId(current.id)
    pending.current = true
    resolve.mutate({ id: current.id, accepted: decision === 'accept', note: note.trim(), internalNotes: internalNotes.trim() }, {
      onSuccess: () => { setDecision(null); setNote(''); setInternalNotes('') },
      onError: () => setDecision(null),
      onSettled: () => { pending.current = false },
    })
  }

  return (
    <>
      <h1 className={base.title}>Resolución de disputas</h1>
      <p className={base.muted}>La garantía se abre al finalizar el viaje. Los reclamos del propietario aparecen aquí automáticamente.</p>
      <p className={styles.inbox}>Bandeja: {open} abiertas · {review} en revisión · {resolved} resueltas</p>
      {resolve.error && <p role="alert">{resolve.error.message}</p>}
      {resolution && <p role="status">{resolution.message}</p>}
      {disputes.length === 0 && <p className={base.state}>No hay disputas.</p>}

      <div className={styles.selector} role="group" aria-label="Disputas">
        {disputes.map((d) => (
          <button key={d.id} type="button" className={styles.selBtn} disabled={resolve.isPending} aria-pressed={d.id === current?.id} onClick={() => { setSelectedId(d.id); setNote(''); setInternalNotes(''); resolve.reset() }}>
            {d.id}{isResolved(d.status) ? ' ✓' : ''}
          </button>
        ))}
      </div>

      {current && (
        <>
          <section className={styles.disputeCard}>
            <div>
              <h2>Disputa {current.id}</h2>
              <p>{current.reservation?.vessel_name ?? 'Embarcación no informada'} · Reserva {current.reservation?.reservation_code ?? current.reservationId}</p>
              <p>Arrendatario: {current.reservation?.renter_name ?? 'No informado'} · Anfitrión: {current.reservation?.owner_name ?? 'No informado'}</p>
            </div>
            <span className={styles.deadline}>
              {currentStatus} · Fin de ventana: {disputeDate(current.windowEnd)}
            </span>
          </section>

          <div className={styles.twoPanels}>
            <section className={styles.infoPanel}>
              <h3>Reclamo del Propietario</h3>
              <small>{current.claimData ? `Registrado el ${disputeDate(current.claimData.registered_at)}` : 'Todavía no hay un reclamo formal.'}</small>
              <p>{current.claim ?? 'La apertura de garantía no implica que exista un daño.'}</p>
              {current.claimData && <p>{DAMAGE_CATEGORIES.find(({ value }) => value === current.claimData.damage_category)?.label ?? 'Sin categoría'}</p>}
              {(current.claimData?.evidence_urls ?? []).filter(isEvidenceUrl).map((url, index) => <p key={url}><a href={url} target="_blank" rel="noopener noreferrer">Ver evidencia {index + 1}</a></p>)}
            </section>
            <section className={styles.infoPanel}>
              <h3>Novedades registradas al cierre</h3>
              <small>Texto informativo del check-out (CU-07) · no es un reclamo formal</small>
              <p>{current.reservation?.completion_notes || 'Sin novedades informadas.'}</p>
            </section>
          </div>
          {detail.data === null && <p className={base.muted}>El servicio desplegado aún no publica el detalle ampliado. Puedes revisar el reclamo y resolverlo desde esta bandeja.</p>}
          {detail.error && <p role="alert">No se pudo actualizar el detalle. La bandeja y el reclamo siguen disponibles. <Button variant="secondary" onClick={() => detail.refetch()}>Reintentar detalle</Button></p>}

          {isResolved(current.status) ? (
            <div className={styles.resolved}>
              Disputa resuelta: {currentStatus}. Motivo: {current.reason ?? resolution?.reason ?? 'Sin motivo informado'}
              {current.resolvedAt && <p>Resuelta el {disputeDate(current.resolvedAt)} por {current.resolvedBy ?? 'el sistema'}.</p>}
              {current.internalNotes && <p>Notas internas: {current.internalNotes}</p>}
            </div>
          ) : (
            <>
              <Textarea label="Motivo de la resolución (opcional, solo informativo)" maxLength={1000} placeholder="Ej: El desgaste reportado es normal por uso, no corresponde a un daño" value={note} onChange={(e) => setNote(e.target.value)} />
              <Textarea label="Notas internas" maxLength={1000} value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} />
              <div className={styles.resolveBar}>
                <Button className={styles.reject} disabled={resolve.isPending || !current.claimData} onClick={() => { resolve.reset(); setDecision('reject') }}>Rechazar reclamo</Button>
                <Button disabled={resolve.isPending || !current.claimData} onClick={() => { resolve.reset(); setDecision('accept') }}>Aceptar reclamo</Button>
              </div>
            </>
          )}

          <DisputeResolutionModal
            open={decision !== null}
            onClose={() => { if (!resolve.isPending) setDecision(null) }}
            onConfirm={confirm}
            loading={resolve.isPending}
            disputeCode={`${current.id} · ${decision === 'accept' ? 'aceptar' : 'rechazar'} reclamo`}
            claim={current.claim ?? '—'}
            note={note}
            onNoteChange={setNote}
          />
        </>
      )}
    </>
  )
}
