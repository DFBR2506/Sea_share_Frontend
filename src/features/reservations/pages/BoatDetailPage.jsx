import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { StatGrid } from '@/components/cards'
import boatIcon from '@/assets/icons/boat.svg'
import { Button, DateRangeCalendar } from '@/components/ui'
import { copDecimal, formatFull, formatRange, copMoney, inclusiveDays, toISO } from '@/lib/dates'
import { m3ErrorMessage } from '@/features/finance/errors'
import { useEstimate } from '@/features/finance/hooks'
import { useBoat } from '../hooks'
import { boatUuid } from '../api'
import { clearExpiredCheckout } from '../checkout/checkoutState'
import styles from './pages.module.css'

export default function BoatDetailPage() {
  const { boatId } = useParams()
  const navigate = useNavigate()
  const { data: boat, isPending } = useBoat(boatId)
  const [range, setRange] = useState({ start: null, end: null })
  const [pax, setPax] = useState(1)

  const days = range.start && range.end ? inclusiveDays(range.start, range.end) : 0
  // UC02 · estimación real de M3: la clave del query cambia con la selección, así la respuesta
  // de una selección anterior se descarta y la petición en curso se aborta con su señal.
  const estimate = useEstimate({
    boatId: boatUuid(boatId),
    startDate: days ? toISO(range.start) : '',
    endDate: days ? toISO(range.end) : '',
    passengers: pax,
  })

  if (isPending) return <p className={styles.state}>Cargando…</p>
  if (!boat) return <p className={styles.state}>No encontramos esta embarcación.</p>

  const rangeLabel = days ? formatRange(range.start, range.end) : ''

  const goToPayment = () => {
    try { clearExpiredCheckout(window.sessionStorage) } catch { /* Storage bloqueado. */ }
    const q = new URLSearchParams({ start: toISO(range.start), end: toISO(range.end), pax: String(pax) })
    navigate(`/explorar/${boat.id}/pago?${q}`)
  }

  // Sin UUID en el stub de Flota la consulta queda desactivada (isPending eterno en v5): no hay estimación.
  const estimateTotal = !boatUuid(boatId) ? 'No disponible' : estimate.isPending ? 'Calculando…' : estimate.data ? copDecimal(estimate.data.total) : 'No disponible'

  return (
    <>
      <button type="button" className={styles.back} onClick={() => navigate('/explorar')}>‹ Volver a resultados</button>
      <div className={styles.detail}>
        <div>
          <div className={styles.photo} role="img" aria-label="Foto del barco"><img src={boatIcon} alt="" width="36" height="36" /><span>Sin fotos disponibles</span></div>
          <h2 className={styles.h2}>Elige la fecha de tu viaje</h2>
          <p className={styles.hint}>Toca una fecha de inicio y luego una de fin para reservar varios días</p>
          <DateRangeCalendar value={range} onChange={setRange} />
          <div className={styles.dates}>
            <div className={styles.dateBox}><span className={styles.dateIcon} /><div><small>Fecha de inicio</small><strong>{range.start ? formatFull(range.start) : '—'}</strong></div></div>
            <div className={styles.dateBox}><span className={styles.dateIcon} /><div><small>Fecha de fin</small><strong>{range.end ? formatFull(range.end) : '—'}</strong></div></div>
          </div>
        </div>

        <div>
          <h1 className={styles.name}>{boat.name}</h1>
          <p className={styles.loc}>{boat.location}</p>
          <p className={styles.specs}>{boat.passengers} pasajeros · {boat.cabins} camarotes · {boat.lengthM} m de eslora</p>
          <StatGrid items={[
            { value: boat.passengers, label: 'Pasajeros' },
            { value: boat.captain ? 'Sí' : 'No', label: 'Cap. incluido' },
            { value: `${boat.lengthFt} ft`, label: 'Eslora' },
            { value: boat.cabins, label: 'Camarotes' },
          ]} />
          <h2 className={styles.sectionTitle}>Qué ofrece este barco</h2>
          <div className={styles.amenities}>
            {boat.amenities.map((a) => <div key={a} className={styles.amenity}>{a}</div>)}
          </div>
          <div className={styles.host}>
            <span className={styles.avatar}>CM</span>
            <div><strong>Anfitrión: {boat.host.name}</strong>{boat.host.badge}</div>
          </div>

          <div className={styles.booking}>
            <div className={styles.bookingHead}>
              <div className={styles.price}>{copMoney(boat.pricePerDay)} <small>/ día</small></div>
              {days > 0 && <span className={styles.chip}>{rangeLabel}</span>}
            </div>
            <div className={styles.paxRow}>
              <div><strong>Pasajeros</strong><span className={styles.muted}>Máx. {boat.passengers} personas</span></div>
              <div className={styles.stepper}>
                <button type="button" aria-label="Menos pasajeros" disabled={pax <= 1} onClick={() => setPax(pax - 1)}>−</button>
                <span>{pax}</span>
                <button type="button" aria-label="Más pasajeros" disabled={pax >= boat.passengers} onClick={() => setPax(pax + 1)}>+</button>
              </div>
            </div>
            {days > 0 && (
              <>
                <div className={styles.totalRow}>
                  <span>Total estimado · {days} {days === 1 ? 'día' : 'días'} · {pax} {pax === 1 ? 'pasajero' : 'pasajeros'}</span>
                  <strong>{estimateTotal}</strong>
                </div>
                {estimate.data?.warning && <p className={styles.muted}>{estimate.data.warning}</p>}
                {estimate.isError && (
                  <p className={styles.muted} role="alert">
                    No se pudo estimar el total: {m3ErrorMessage(estimate.error)}
                  </p>
                )}
              </>
            )}
            <Button block disabled={!days} onClick={goToPayment}>Reservar</Button>
          </div>
        </div>
      </div>

    </>
  )
}
