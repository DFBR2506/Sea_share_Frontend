import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, StatusBadge } from '@/components/ui'
import { cx } from '@/lib/cx'
import { money } from '@/lib/dates'
import { formatMinSec, useCountdown } from '@/lib/useCountdown'
import { BREAKDOWN, RESERVATION_STATUS_UI } from '../api/ownerMocks'
import { ClaimModal } from '../components/ClaimModal'
import { HostCancelModal } from '../components/HostCancelModal'
import { useBoat, useCancelByHost, useEndNavigation, useMarkNoShow, useOwnerReservation, useStartNavigation, useSubmitClaim } from '../hooks'
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
        <Button className={over ? styles.outlineBtn : styles.dark} onClick={onStart} disabled={busy}>Marcar inicio de la navegación</Button>
        <small>El cliente llegó{over ? ' tarde' : ''} y puede abordar</small>
        <Button variant={over ? 'danger' : 'secondary'} disabled={!over || busy} onClick={onNoShow}>Marcar inasistencia</Button>
        <small>{over ? 'Cancela la reserva de forma definitiva' : `Disponible en ${formatMinSec(left)}`}</small>
      </aside>
    </div>
  )
}

export default function OwnerReservationDetailPage() {
  const { reservationId } = useParams()
  const navigate = useNavigate()
  const { data: r, isPending } = useOwnerReservation(reservationId)
  const { data: boat } = useBoat(r?.boatId)
  const start = useStartNavigation()
  const end = useEndNavigation()
  const noShow = useMarkNoShow()
  const cancel = useCancelByHost()
  const claim = useSubmitClaim()
  const [modal, setModal] = useState(null) // 'cancel' | 'claim'

  if (isPending) return <p className={base.state}>Cargando…</p>
  if (!r || !boat) return <p className={base.state}>No encontramos esta reserva.</p>

  const ui = RESERVATION_STATUS_UI[r.status]
  const busy = start.isPending || end.isPending || noShow.isPending
  const cancelable = r.status === 'CONFIRMADA' || r.status === 'PENDIENTE_PAGO'
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
          <Button className={styles.outlineBtn} onClick={() => start.mutate(r.id)} disabled={busy}>Marcar inicio de la navegación</Button>
          <small>El cliente llegó tarde y puede abordar</small>
          <Button variant="danger" onClick={() => noShow.mutate(r.id)} disabled={busy}>Marcar inasistencia</Button>
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
          <Button variant="secondary" disabled>Marcar inicio de la navegación</Button>
          <small>Se habilita a las {r.embark.split(', ')[1]}</small>
          <Button variant="secondary" disabled>Marcar inasistencia</Button>
          <small>Se habilita 30 min después de la hora de salida</small>
        </aside>
      </div>
    )
  } else if (r.status === 'EN_NAVEGACION') {
    status = (
      <div className={cx(styles.banner, styles.bannerGreen)}>
        <div>
          <StatusBadge tone="neutral">En navegación</StatusBadge>
          <h2 className={styles.bannerTitle}>El viaje está en curso</h2>
          <p className={styles.small}><strong>Regreso pactado: {r.disembark} (hora del puerto de {boat.shortLocation})</strong> · Hora de salida real: <strong>{r.realDeparture}</strong></p>
        </div>
        <Button className={styles.dark} onClick={() => end.mutate(r.id)} disabled={busy}>Marcar fin de la navegación</Button>
      </div>
    )
  } else if (r.status === 'COMPLETADA') {
    status = r.claim ? (
      <div className={cx(styles.banner, styles.bannerGrey)}>
        <span style={{ fontSize: 16, color: 'var(--seashare-color-text-secondary)' }}>{r.claim.status === 'PENDIENTE' ? 'PENDIENTE' : r.claim.status}</span>
        <div>
          <h2 className={styles.bannerTitle}>{r.claim.status === 'PENDIENTE' ? 'Tu reclamo está en revisión' : `Tu reclamo fue ${r.claim.status === 'ACEPTADO' ? 'aceptado' : 'rechazado'}`}</h2>
          <p className={styles.small}>Enviado el {r.claim.sentAt}. {r.claim.status === 'PENDIENTE' ? 'Un administrador revisará tu reporte.' : 'La decisión fue notificada a ambas partes.'}</p>
        </div>
      </div>
    ) : (
      <div className={cx(styles.banner, styles.bannerGrey)}>
        <div>
          <h2 className={styles.bannerTitle}>Viaje completado</h2>
          <p className={styles.small}>¿Hubo algún daño o incumplimiento? Puedes reportar un reclamo sobre el depósito.</p>
        </div>
        <Button variant="secondary" onClick={() => setModal('claim')}>Reportar reclamo</Button>
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
          <h2 className={styles.bannerTitle}>Pendiente de pago</h2>
          <p className={styles.small}>La reserva se confirmará cuando el arrendatario complete el pago.</p>
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

      <div className={styles.cols}>
        <div>
          <div className={styles.gallery} aria-label="Fotos del barco"><div /><div /><div /></div>
          <section className={base.panel}>
            <h2>Itinerario</h2>
            <div className={base.lines}>
              {itinerary.map(([k, v]) => <div key={k} className={base.line}><span>{k}</span><span style={{ color: 'var(--seashare-color-text-primary)' }}>{v}</span></div>)}
            </div>
          </section>
          {r.claim && (
            <section className={base.panel}>
              <h2>Tu reclamo</h2>
              <p className={styles.claimText}>“{r.claim.text}”</p>
              <p className={base.muted} style={{ marginTop: 8 }}>Registrado el {r.claim.sentAt}. Este texto es tu reclamo formal.</p>
            </section>
          )}
        </div>
        <aside>
          <section className={base.panel}>
            <h2>Cliente</h2>
            <div className={styles.client}>
              <span className={styles.avatar} />
              <div><strong>{r.guest}</strong><span>{r.guestTrips} viajes</span></div>
            </div>
          </section>
          <section className={base.panel}>
            <span className={base.muted}>Resumen de pago</span>
            {r.status === 'COMPLETADA' && r.claim ? (
              <div className={base.lines} style={{ marginTop: 12 }}><div className={base.line}><span>Depósito de garantía</span><span>{money(BREAKDOWN.deposit)}</span></div></div>
            ) : (
              <>
                <div className={base.lines} style={{ margin: '12px 0' }}>
                  <div className={base.line}><span>Tarifa base</span><span>{money(BREAKDOWN.base)}</span></div>
                  <div className={base.line}><span>Comisión</span><span>{money(BREAKDOWN.commission)}</span></div>
                  <div className={base.line}><span>Seguro</span><span>{money(BREAKDOWN.insurance)}</span></div>
                  <div className={base.line}><span>Depósito</span><span>{money(BREAKDOWN.deposit)}</span></div>
                </div>
                <div className={styles.net}><span>Neto a recibir:</span><strong>{money(BREAKDOWN.net)}</strong></div>
              </>
            )}
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
        onSubmit={(text) => claim.mutate({ id: r.id, text }, { onSuccess: () => setModal(null) })}
      />
    </>
  )
}
