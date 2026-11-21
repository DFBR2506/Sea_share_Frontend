import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { VesselPhoto } from '@/components/cards/VesselPhoto'
import { useNow } from '@/lib/useNow'
import { canRegisterClaim, DAMAGE_CATEGORIES, disputeDate, isEvidenceUrl } from '../disputes'
import { EndNavigationModal } from '../components/EndNavigationModal'
import { Button, StatusBadge } from '@/components/ui'
import { cx } from '@/lib/cx'
import { formatMinSec, useCountdown } from '@/lib/useCountdown'
import { getReservationStatusUI } from '../api/statusMap'
import { listDisputes } from '../api'
import { ClaimModal } from '../components/ClaimModal'
import { HostCancelModal } from '../components/HostCancelModal'
import { useCancelByHost, useEndNavigation, useMarkNoShow, useOwnerReservation, useStartNavigation, useSubmitClaim } from '../hooks'
import base from './pages.module.css'
import styles from './owner.module.css'

function Tiles({ items }) {
  return (
    <div className={styles.tiles}>
      {items.map(([value, label]) => <div key={label} className={styles.tile}><strong>{value}</strong><span>{label}</span></div>)}
    </div>
  )
}

// Fase "CORTESIA": el contador corre en vivo; al llegar a 0 pasa a "tolerancia cumplida"
function Courtesy({ r, boat, onStart, onNoShow, busy }) {
  const left = useCountdown(r.toleranceSeconds)
  const over = left === 0
  const departure = r.embark.split(', ')[1]
  return (
    <div className={cx(styles.statusRow, styles.withActions)}>
      <section className={styles.panel}>
        <div className={cx(styles.alert, over ? styles.alertDanger : styles.alertWarn)}>
          <strong>{over ? 'Tiempo de cortesía cumplido' : 'El cliente aún no llega'}</strong>
          {over
            ? 'Pasaron 30 minutos desde la hora acordada y el cliente no se ha presentado en el muelle. Puedes iniciar el viaje si el cliente llega ahora, o marcar la inasistencia para cancelar la reserva.'
            : 'Ya pasó la hora acordada de salida. El sistema de tolerancia sigue corriendo; "Marcar inasistencia" se habilita cuando se cumplan los 30 minutos.'}
        </div>
        <span className={cx(styles.tag, over ? styles.tagDanger : styles.tagWarn)}>{over ? '30 min de tolerancia cumplidos' : 'Tiempo de cortesía en curso'}</span>
        <h2 className={styles.big}>{over ? 'Han pasado 30 minutos desde las ' + departure : `Faltan ${formatMinSec(left)} para poder reportar inasistencia`}</h2>
        <p className={styles.small}>{over ? 'Elige una acción: el barco puede zarpar tarde o la reserva puede quedar cancelada por inasistencia' : `Hora de salida acordada: ${r.embark} (hora del puerto de ${boat.shortLocation})`}</p>
      </section>
      <aside className={styles.actionsCard}>
        <h3>Acciones de embarque</h3>
        <Button className={styles.dark} onClick={onStart} disabled={busy}>Marcar inicio de la navegación</Button>
        <small>El cliente llegó{over ? ' tarde' : ''} y puede abordar</small>
        <Button className={styles.dark} disabled={!over || busy} onClick={onNoShow}>Marcar inasistencia</Button>
        <small>{over ? 'Cancela la reserva de forma definitiva' : `Disponible en ${formatMinSec(left)}`}</small>
      </aside>
    </div>
  )
}

export default function OwnerReservationDetailPage() {
  const { reservationId } = useParams()
  const navigate = useNavigate()
  const { data: r, isPending, error } = useOwnerReservation(reservationId)
  const boat = r?.boat
  const start = useStartNavigation()
  const end = useEndNavigation()
  const noShow = useMarkNoShow()
  const cancel = useCancelByHost()
  const claim = useSubmitClaim()
  const claimPending = useRef(false)
  const endPending = useRef(false)
  const now = useNow(1000)
  const [modal, setModal] = useState(null) // 'cancel' | 'claim'
  const { data: disputes, isPending: disputesPending, isFetching: disputesFetching, error: disputesError } = useQuery({
    queryKey: ['m2', 'disputes', 'reservation', reservationId],
    queryFn: ({ signal }) => listDisputes({ reservationId, signal }),
    enabled: r?.status === 'COMPLETADA', retry: false, refetchInterval: 15000,
  })
  const dispute = disputes?.find((item) => item.reservationId === reservationId)
  const canClaim = canRegisterClaim(dispute, now)
  const claimResponse = claim.data?.reservation_id === reservationId ? claim.data : null
  const currentClaim = dispute?.claimData ?? claimResponse?.claim
  const disputeStatus = dispute?.status ?? claimResponse?.status
  const claimStatus = ({ PENDING: 'PENDIENTE', ACCEPTED: 'ACEPTADO', REJECTED: 'RECHAZADO' })[disputeStatus] ?? disputeStatus ?? '—'

  if (error) return <p role="alert" className={base.state}>{error.code}: {error.message}</p>
  if (isPending) return <p className={base.state}>Cargando…</p>
  if (!r || !boat) return <p className={base.state}>No encontramos esta reserva.</p>

  const ui = getReservationStatusUI(r.status)
  const busy = start.isPending || end.isPending || noShow.isPending
  const cancelable = r.status === 'CONFIRMADA'
  const tilesBase = [[r.embark, 'HORA ACORDADA'], [boat.shortLocation, 'PUERTO DE ZARPE'], [String(r.pax), 'PASAJEROS']]

  let status
  if (r.status === 'CONFIRMADA' && r.phase === 'CORTESIA') {
    status = <Courtesy r={r} boat={boat} busy={busy} onStart={() => start.mutate(r.id)} onNoShow={() => noShow.mutate(r.id)} />
  } else if (r.status === 'CONFIRMADA' && r.phase === 'CORTESIA_CUMPLIDA') {
    status = (
      <div className={cx(styles.statusRow, styles.withActions)}>
        <section className={styles.panel}>
          <div className={cx(styles.alert, styles.alertDanger)}>
            <strong>Tiempo de cortesía cumplido</strong>
            Pasaron {r.minutesLate} minutos desde la hora acordada y el cliente no se ha presentado en el muelle. Puedes iniciar el viaje si el cliente llega ahora, o marcar la inasistencia para cancelar la reserva.
          </div>
          <span className={cx(styles.tag, styles.tagDanger)}>30 min de tolerancia cumplidos</span>
          <h2 className={styles.big}>Han pasado {r.minutesLate} minutos desde las {r.embark.split(', ')[1]}</h2>
          <p className={styles.small}>Elige una acción: el barco puede zarpar tarde o la reserva puede quedar cancelada por inasistencia</p>
        </section>
        <aside className={styles.actionsCard}>
          <h3>Acciones de embarque</h3>
          <Button className={styles.dark} onClick={() => start.mutate(r.id)} disabled={busy}>Marcar inicio de la navegación</Button>
          <small>El cliente llegó tarde y puede abordar</small>
          <Button className={styles.dark} onClick={() => noShow.mutate(r.id)} disabled={busy}>Marcar inasistencia</Button>
          <small>Cancela la reserva de forma definitiva</small>
        </aside>
      </div>
    )
  } else if (r.status === 'CONFIRMADA') {
    status = (
      <div className={cx(styles.statusRow, styles.withActions)}>
        <section className={styles.panel}>
          <span className={styles.pill}>Reservada</span>
          <h2 className={styles.big}>Faltan {r.minutesToDeparture} minutos para la hora de salida</h2>
          <p className={styles.small}>El registro de embarque se habilita a las {r.embark.split(', ')[1]} (hora del puerto de {boat.shortLocation})</p>
          <Tiles items={tilesBase} />
        </section>
        <aside className={styles.actionsCard}>
          <h3>Acciones de embarque</h3>
          <Button className={styles.dark} disabled>Marcar inicio de la navegación</Button>
          <small>Se habilita a las {r.embark.split(', ')[1]}</small>
          <Button className={styles.dark} disabled>Marcar inasistencia</Button>
          <small>Se habilita 30 min después de la hora de salida</small>
        </aside>
      </div>
    )
  } else if (r.status === 'EN_NAVEGACION') {
    status = (
      <div className={cx(styles.banner, styles.bannerGreen)}>
        <div>
          <StatusBadge tone="ongoing">En navegación</StatusBadge>
          <h2 className={styles.bannerTitle}>El viaje está en curso</h2>
          <p className={styles.small}><strong>Regreso pactado: {r.disembark} (hora del puerto de {boat.shortLocation})</strong> · Hora de salida real: <strong>{r.realDeparture}</strong></p>
        </div>
        <Button className={styles.dark} disabled={busy || end.isPending} onClick={() => { end.reset(); setModal('end') }}>Marcar fin de la navegación</Button>
      </div>
    )
  } else if (r.status === 'COMPLETADA') {
    status = currentClaim ? (
      <div className={cx(styles.banner, styles.bannerGrey)}>
        <span style={{ fontSize: 16, color: 'var(--seashare-color-brand-primary)' }}>{claimStatus}</span>
        <div>
          <h2 className={styles.bannerTitle}>{disputeStatus === 'PENDING' ? 'Tu reclamo está en revisión' : claimStatus}</h2>
          <p className={styles.small}>Enviado el {disputeDate(currentClaim.registered_at)}.</p>
        </div>
      </div>
    ) : (
      <div className={cx(styles.banner, styles.bannerGrey)}>
        <div>
          <h2 className={styles.bannerTitle}>Viaje completado</h2>
          <p className={styles.small}>{canClaim ? `Puedes reportar un reclamo hasta el ${disputeDate(dispute.windowEnd)} (hora de Colombia).` : dispute ? 'La ventana para reportar un reclamo está cerrada.' : 'Consultando la ventana de garantía abierta al finalizar el viaje.'}</p>
        </div>
        <Button variant="secondary" disabled={!canClaim || disputesFetching || Boolean(disputesError)} onClick={() => { claim.reset(); setModal('claim') }}>Reportar reclamo</Button>
      </div>
    )
  } else if (r.status === 'CANCELADA') {
    status = (
      <div className={cx(styles.banner, styles.bannerRed)}>
        <div>
          <h2 className={styles.bannerTitle} style={{ color: 'var(--seashare-color-brand-accent)' }}>Reserva cancelada</h2>
          <p className={styles.small}>{r.cancelNote}{r.cancelJustification ? ` · ${r.cancelJustification}` : ''}</p>
        </div>
      </div>
    )
  } else {
    status = (
      <div className={cx(styles.banner, styles.bannerGrey)}>
        <div>
          <h2 className={styles.bannerTitle}>{ui.label}</h2>
          {r.status === 'PENDIENTE_PAGO' && <p className={styles.small}>La reserva se confirmará cuando el arrendatario complete el pago.</p>}
        </div>
      </div>
    )
  }

  const completedItinerary = r.status === 'COMPLETADA' || r.status === 'EN_NAVEGACION'
  const itinerary = completedItinerary
    ? [['Salida real', r.realDeparture], [r.status === 'COMPLETADA' ? 'Llegada real:' : 'Regreso pactado', r.status === 'COMPLETADA' ? r.realArrival : r.disembark], ['Puerto de zarpe', boat.shortLocation], ['Pasajeros', `${r.pax} adultos`]]
    : [['Embarque', r.embark], ['Desembarque', r.disembark], ['Puerto de zarpe', boat.shortLocation], ['Pasajeros', `${r.pax} adultos`]]

  return (
    <>
      <button type="button" className={base.back} onClick={() => navigate('/owner/reservas')}>Reservas recibidas &gt; Ver detalles</button>
      <h1 className={base.title}>{boat.name}</h1>
      <p className={base.muted}>{boat.location}</p>
      <p className={base.muted} style={{ marginBottom: 16 }}>Arrendatario: {r.guest} · {r.pax} pasajeros</p>

      {status}
      {r.status === 'COMPLETADA' && disputesPending && !disputesError && <p role="status">Cargando…</p>}
      {disputesError && <p role="alert" className={base.state}>{disputesError.message}</p>}
      {r.status === 'COMPLETADA' && !disputesPending && !disputesError && !dispute && <p className={base.muted}>Esta reserva no tiene una ventana de garantía registrada. No se puede crear un reclamo manualmente sin ella.</p>}
      {claimResponse && <p role="status">{claimResponse.message}</p>}
      {(start.error || end.error || noShow.error || cancel.error) && <p role="alert" className={base.state}>
        {(start.error || end.error || noShow.error || cancel.error).code}: {(start.error || end.error || noShow.error || cancel.error).message}
      </p>}

      <div className={styles.cols}>
        <div>
          <VesselPhoto src={boat.imageUrl} name={boat.name} />
          <section className={cx(base.panel, styles.sheet)}>
            <h2>Itinerario</h2>
            <div className={base.lines}>
              {itinerary.map(([k, v]) => <div key={k} className={base.line}><span>{k}</span><span style={{ color: 'var(--seashare-color-text-primary)' }}>{v}</span></div>)}
            </div>
          </section>
          {currentClaim && (
            <section className={cx(base.panel, styles.sheet)}>
              <h2>Tu reclamo</h2>
              <p className={styles.claimText}>“{currentClaim.description ?? '—'}”</p>
              <p className={base.muted} style={{ marginTop: 8 }}>Registrado el {disputeDate(currentClaim.registered_at)}. Este texto es tu reclamo formal.</p>
              <p>{DAMAGE_CATEGORIES.find(({ value }) => value === currentClaim.damage_category)?.label ?? 'Sin categoría'}</p>
              {(currentClaim.evidence_urls ?? []).filter(isEvidenceUrl).map((url, index) => <p key={url}><a href={url} target="_blank" rel="noopener noreferrer">Ver evidencia {index + 1}</a></p>)}
            </section>
          )}
        </div>
        <aside>
          <section className={cx(base.panel, styles.sheet)}>
            <h2>Cliente</h2>
            <div className={styles.client}>
              <span className={styles.avatar} />
              <div><strong>{r.guest}</strong><span>{r.guestTrips} viajes</span></div>
            </div>
          </section>
          <section className={cx(base.panel, styles.sheet)}>
            <span className={base.muted}>{r.sectionTitle ?? 'Resumen de pago'}</span>
            <div className={styles.net}>
              <span>{r.totalPaid != null ? 'Total pagado' : r.calculatedTotal != null ? 'Total calculado' : r.estimatedTotal != null ? 'Total estimado' : 'Sin importe'}</span>
              <strong>{r.totalPaid ?? r.calculatedTotal ?? r.estimatedTotal ?? ''}</strong>
            </div>
            {r.clarifyingNote != null && <p className={base.muted}>{r.clarifyingNote}</p>}
          </section>
          {cancelable ? (
            <Button variant="outlineDanger" block onClick={() => setModal('cancel')}>✕ Cancelar reserva</Button>
          ) : (
            <div className={styles.sideBadge}><StatusBadge tone={ui.tone}>{ui.label}</StatusBadge></div>
          )}
        </aside>
      </div>

      <HostCancelModal
        key={`cancel-${modal === 'cancel'}`}
        open={modal === 'cancel'}
        onClose={() => setModal(null)}
        reservation={r}
        boatName={boat.name}
        loading={cancel.isPending}
        onConfirm={(data) => cancel.mutate({ id: r.id, ...data }, { onSuccess: () => setModal(null) })}
      />
      <ClaimModal
        key={`claim-${modal === 'claim'}`}
        open={modal === 'claim'}
        onClose={() => setModal(null)}
        loading={claim.isPending}
        error={claim.error}
        response={claimResponse}
        onSubmit={(data) => {
          if (!canRegisterClaim(dispute) || claimPending.current) return
          claimPending.current = true
          claim.mutate({ id: dispute.id, ...data }, { onSettled: () => { claimPending.current = false } })
        }}
      />
      <EndNavigationModal key={`end-${modal === 'end'}`} open={modal === 'end'} onClose={() => setModal(null)}
        loading={end.isPending} error={end.error} onConfirm={(remarks) => {
          if (endPending.current) return
          endPending.current = true
          end.mutate({ id: r.id, remarks }, {
            onSuccess: () => setModal(null), onSettled: () => { endPending.current = false },
          })
        }} />
    </>
  )
}
