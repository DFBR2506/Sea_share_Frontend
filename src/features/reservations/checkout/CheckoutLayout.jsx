import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Outlet, useBlocker, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui'
import { toISO } from '@/lib/dates'
import { useNow } from '@/lib/useNow'
import { sessionIdentity } from '@/lib/sessionIdentity'
import { abandonReservation, createReservation, getCheckoutReservation, getQuotation } from '../api'
import { useBoat } from '../hooks'
import { CheckoutContext } from './checkoutContext'
import { CHECKOUT_STORAGE_KEY, loadCheckout, remainingSeconds, saveCheckout } from './checkoutState'
import { departureError } from './departure'
import { readPaymentSelection } from './selection'
import styles from '../pages/pages.module.css'

function sessionStorageOrNull() {
  try { return window.sessionStorage } catch { return null }
}

async function fingerprint(body) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(body)))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function CheckoutSession({ boat, selection, snapshot }) {
  const [checkout, setCheckout] = useState(() => loadCheckout(sessionStorageOrNull(), snapshot))
  const current = useRef(checkout)
  const pending = useRef(null)
  const leaving = useRef(null)
  const [leaveError, setLeaveError] = useState(null)
  const [recovery, setRecovery] = useState(checkout.reservationId ? 'loading' : 'ready')
  const now = useNow(1000)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const expiresAt = Math.min(checkout.expiresAt, checkout.serverExpiresAt ?? Infinity)
  const left = remainingSeconds(expiresAt, now)
  const update = useCallback((patch) => {
    current.current = { ...current.current, ...patch }
    saveCheckout(sessionStorageOrNull(), current.current)
    setCheckout(current.current)
  }, [])

  useEffect(() => { saveCheckout(sessionStorageOrNull(), current.current) }, [])

  useEffect(() => {
    const id = current.current.reservationId
    if (!id) return
    let active = true
    getCheckoutReservation(id).then((data) => {
      if (!active) return
      if (data.status !== 'INITIATED' || current.current.paymentStarted) setRecovery('submitted')
      else setRecovery('ready')
    }).catch(() => { if (active) setRecovery('error') })
    return () => { active = false }
  }, [])

  const canContinue = () => current.current.accepted
    && Date.now() < Math.min(current.current.expiresAt, current.current.serverExpiresAt ?? Infinity)
    && recovery === 'ready'

  const create = useCallback((contact, departureTime) => {
    if (pending.current) return pending.current
    pending.current = (async () => {
      const saved = current.current
      if (!saved.accepted || Date.now() >= Math.min(saved.expiresAt, saved.serverExpiresAt ?? Infinity)) throw new Error('El checkout no está vigente.')
      const invalidDeparture = departureError(snapshot.start, departureTime, boat.timezone)
      if (invalidDeparture) throw new Error(invalidDeparture)
      const estimatedTotal = String(snapshot.quotation.total_amount)
      if (!/^\d{1,14}(\.\d{1,4})?$/.test(estimatedTotal)) throw new Error('El total estimado no tiene el formato requerido.')
      const body = {
        vessel_id: snapshot.boatId, start_date: snapshot.start, end_date: snapshot.end,
        passengers: snapshot.pax, departure_time: departureTime, estimated_total: estimatedTotal,
        holder: { full_name: contact.name, phone: contact.phone },
      }
      const requestFingerprint = await fingerprint(body)
      if (saved.requestFingerprint && saved.requestFingerprint !== requestFingerprint) {
        if (saved.paymentStarted) throw new Error('Ya se envió un pago para esta reserva. Consulta su estado en Mis reservas.')
        if (saved.reservationId) {
          const result = await abandonReservation(saved.reservationId, snapshot)
          if (!result.supported) throw new Error('El contacto ya está registrado. Retoma con los mismos datos o espera el vencimiento para cambiarlo.')
        } else if (saved.requestStartedAt) {
          throw new Error('La creación anterior no pudo confirmarse. No se creará otra reserva hasta que venza este checkout.')
        }
        update({ reservationId: null, idempotencyKey: crypto.randomUUID(), requestStartedAt: null })
      }
      if (current.current.reservationId) {
        const data = await getCheckoutReservation(current.current.reservationId)
        if (data.status !== 'INITIATED') throw new Error('Esta reserva ya cambió de estado. Consúltala en Mis reservas.')
        return data
      }
      if (current.current.requestStartedAt && Date.now() - current.current.requestStartedAt >= 60000) {
        throw new Error('No se pudo confirmar la creación anterior. Espera el vencimiento antes de iniciar otra reserva.')
      }
      update({ requestFingerprint, departureTime, requestStartedAt: current.current.requestStartedAt ?? Date.now() })
      const data = await createReservation(body, current.current.idempotencyKey)
      update({ reservationId: data.reservation_id, serverExpiresAt: Date.parse(data.ttl_expires_at) })
      queryClient.invalidateQueries({ queryKey: ['m2', 'reservations'] })
      return data
    })().finally(() => { pending.current = null })
    return pending.current
  }, [boat.timezone, snapshot, update, queryClient])

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    const prefix = `/explorar/${snapshot.boatId}/pago`
    const params = new URLSearchParams(nextLocation.search)
    const sameSelection = ['start', 'end', 'pax'].every((key) => params.get(key) === new URLSearchParams(currentLocation.search).get(key))
    const staying = (nextLocation.pathname === prefix || nextLocation.pathname.startsWith(`${prefix}/`)) && sameSelection
    return !staying && !current.current.paymentStarted && Boolean(current.current.reservationId || pending.current)
  })

  useEffect(() => {
    if (blocker.state !== 'blocked') { leaving.current = null; return }
    let active = true
    leaving.current ??= (async () => {
      try { await pending.current } catch { /* Una creación desconocida queda protegida por el TTL. */ }
      if (current.current.reservationId && !current.current.paymentStarted) await abandonReservation(current.current.reservationId, snapshot)
      try { sessionStorageOrNull()?.removeItem(CHECKOUT_STORAGE_KEY) } catch { /* Storage bloqueado. */ }
      queryClient.invalidateQueries({ queryKey: ['m2'] })
    })()
    leaving.current.then(() => { if (active) blocker.proceed() }, (error) => { if (active) setLeaveError(error) })
    return () => { active = false }
  }, [blocker, snapshot, queryClient])

  const beginPayment = useCallback(() => {
    const invalid = departureError(snapshot.start, current.current.departureTime, boat.timezone)
    if (invalid) throw new Error(invalid)
    // Una respuesta perdida no autoriza a descartar una reserva que podría haberse cobrado.
    update({ paymentStarted: true })
  }, [snapshot.start, boat.timezone, update])

  return (
    <CheckoutContext.Provider value={{
      boat, selection, quotation: snapshot.quotation, checkoutId: checkout.id,
      reservationId: checkout.reservationId, createReservation: create, beginPayment,
      departureTime: checkout.departureTime, now, expiresAt, accepted: checkout.accepted,
      paymentStarted: checkout.paymentStarted,
      setAccepted: (accepted) => { if (Date.now() < expiresAt) update({ accepted }) },
      left, expired: left === 0, canContinue,
    }}>
      {recovery === 'loading' ? <p role="status">Recuperando tu checkout…</p>
        : recovery === 'error' ? <p role="alert">No se pudo recuperar la reserva. Recarga antes de continuar; no se creará otra reserva.</p>
          : recovery === 'submitted' ? <section className={styles.panel}>
            <p>Esta reserva ya tiene un pago enviado o cambió de estado. Consulta el resultado antes de intentar otro pago.</p>
            <Button onClick={() => navigate(`/mis-reservas/${checkout.reservationId}`)}>Ver mi reserva</Button>
          </section> : <>
            <Button variant="secondary" disabled={blocker.state === 'blocked'} onClick={() => navigate('/explorar')}>Salir del checkout</Button>
            <Outlet />
          </>}
      {blocker.state === 'blocked' && !leaveError && <p role="status">Descartando el checkout sin pagar…</p>}
      {leaveError && blocker.state === 'blocked' && <section className={styles.panel}>
        <p role="alert">No se pudo confirmar el abandono. No se ha solicitado ninguna cancelación de pago. El checkout vencerá automáticamente.</p>
        <Button onClick={() => { setLeaveError(null); blocker.reset() }}>Permanecer aquí</Button>
        <Button variant="secondary" onClick={() => blocker.proceed()}>Salir y esperar el vencimiento</Button>
      </section>}
    </CheckoutContext.Provider>
  )
}

export default function CheckoutLayout() {
  const { boatId } = useParams()
  const [params] = useSearchParams()
  const { data: boat, isPending, error } = useBoat(boatId)
  const now = useNow()
  const { role, userId } = sessionIdentity()
  const selection = readPaymentSelection(params, boat?.passengers, { now, timezone: boat?.timezone })
  const startDate = selection ? toISO(selection.start) : ''
  const endDate = selection ? toISO(selection.end) : ''
  const pax = selection?.pax
  const { data: quotation, error: quotationError, isFetching } = useQuery({
    queryKey: ['m2', 'quotation', boatId, startDate, endDate, pax],
    queryFn: () => getQuotation(boatId, startDate, endDate, pax),
    enabled: Boolean(selection), staleTime: 0, retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false,
  })
  if (error) return <p role="alert" className={styles.state}>{error.message}</p>
  if (isPending) return <p className={styles.state}>Cargando…</p>
  if (!boat || !selection) return <p role="alert" className={styles.state}>Elige fechas desde hoy y pasajeros válidos para continuar.</p>
  if (quotationError) return <p role="alert" className={styles.state}>{quotationError.message}</p>
  if (isFetching || !quotation) return <p className={styles.state}>Cargando…</p>
  const snapshot = { boatId, start: startDate, end: endDate, pax, quotation, role, userId }
  return <CheckoutSession key={JSON.stringify(snapshot)} boat={boat} selection={selection} snapshot={snapshot} />
}
