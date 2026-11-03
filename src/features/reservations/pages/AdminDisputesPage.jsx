import { useState } from 'react'
import { DisputeResolutionModal } from '@/components/modals'
import { Button, Textarea } from '@/components/ui'
import { RESOLVED_BASE } from '../api/ownerMocks'
import { useDisputes, useResolveDispute } from '../hooks'
import base from './pages.module.css'
import styles from './owner.module.css'

export default function AdminDisputesPage() {
  const { data: disputes = [], isPending } = useDisputes()
  const resolve = useResolveDispute()
  const [selectedId, setSelectedId] = useState(null)
  const [note, setNote] = useState('')
  const [decision, setDecision] = useState(null) // 'accept' | 'reject'

  if (isPending) return <p className={base.state}>Cargando…</p>

  const open = disputes.filter((d) => d.status === 'PENDIENTE').length
  const review = disputes.filter((d) => d.status === 'EN_REVISION').length
  const resolved = RESOLVED_BASE + disputes.filter((d) => d.status === 'RESUELTA').length
  const current = disputes.find((d) => d.id === selectedId) ?? disputes.find((d) => d.status !== 'RESUELTA') ?? disputes[0]

  const confirm = () => {
    resolve.mutate({ id: current.id, accepted: decision === 'accept', note: note.trim() }, { onSuccess: () => { setDecision(null); setNote('') } })
  }

  return (
    <>
      <h1 className={base.title}>Resolución de disputas</h1>
      <p className={styles.inbox}>Bandeja: {open} abiertas · {review} en revisión · {resolved} resueltas</p>

      <div className={styles.selector} role="group" aria-label="Disputas">
        {disputes.map((d) => (
          <button key={d.id} type="button" className={styles.selBtn} aria-pressed={d.id === current?.id} onClick={() => { setSelectedId(d.id); setNote('') }}>
            {d.id}{d.status === 'RESUELTA' ? ' ✓' : ''}
          </button>
        ))}
      </div>

      {current && (
        <>
          <section className={styles.disputeCard}>
            <div>
              <h2>Disputa {current.id}</h2>
              <p>{current.boatName} · Reserva {current.code} · Arrendatario: {current.guest} · Anfitrión: {current.host}</p>
            </div>
            <span className={styles.deadline}>
              {current.status === 'RESUELTA' ? 'RESUELTA' : `${current.status === 'EN_REVISION' ? 'EN REVISIÓN' : 'PENDIENTE'} · ${current.hoursLeft}h restantes`}
            </span>
          </section>

          <div className={styles.twoPanels}>
            <section className={styles.infoPanel}>
              <h3>Reclamo del Propietario</h3>
              <small>{current.host}</small>
              <p>{current.claim}</p>
            </section>
            <section className={styles.infoPanel}>
              <h3>Novedades registradas al cierre</h3>
              <small>Texto informativo del check-out (CU-07) · no es un reclamo formal</small>
              <p>{current.closing}</p>
            </section>
          </div>

          {current.status === 'RESUELTA' ? (
            <div className={styles.resolved}>
              Disputa resuelta: reclamo {current.accepted ? 'aceptado' : 'rechazado'}.{current.note ? ` Motivo: ${current.note}` : ''}
            </div>
          ) : (
            <>
              <Textarea label="Motivo de la resolución (opcional, solo informativo)" placeholder="Ej: El desgaste reportado es normal por uso, no corresponde a un daño" value={note} onChange={(e) => setNote(e.target.value)} />
              <div className={styles.resolveBar}>
                <Button className={styles.reject} onClick={() => setDecision('reject')}>Rechazar reclamo</Button>
                <Button onClick={() => setDecision('accept')}>Aceptar reclamo</Button>
              </div>
            </>
          )}

          <DisputeResolutionModal
            open={decision !== null}
            onClose={() => setDecision(null)}
            onConfirm={confirm}
            loading={resolve.isPending}
            disputeCode={`${current.id} · ${decision === 'accept' ? 'aceptar' : 'rechazar'} reclamo`}
            claim={current.claim}
            note={note}
            onNoteChange={setNote}
          />
        </>
      )}
    </>
  )
}
