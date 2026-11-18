import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Outlet, useParams, useSearchParams } from 'react-router-dom'
import { toISO } from '@/lib/dates'
import { createReservation, getQuotation } from '../api'
import { useBoat } from '../hooks'
import { CheckoutContext } from './checkoutContext'
import { CHECKOUT_STORAGE_KEY, loadCheckout, remainingSeconds, saveCheckout } from './checkoutState'
import { readPaymentSelection } from './selection'
import styles from '../pages/pages.module.css'

function sessionStorageOrNull() {
  try { return window.sessionStorage } catch { return null }
}

function CheckoutSession({ boat, selection, snapshot }) {
  const [checkout, setCheckout] = useState(() => loadCheckout(sessionStorageOrNull(), snapshot))
  const [now, setNow] = useState(Date.now)
  const [reservation, setReservation] = useState(null)
  const attempt = useRef(null)
  const pending = useRef(null)
  const create = useCallback((contact, departureTime) => {
    if (!checkout.accepted || Date.now() >= checkout.expiresAt) return Promise.reject(new Error('El checkout no está vigente.'))
    const estimatedTotal = String(snapshot.quotation.total_amount)
    if (!/^\d{1,14}(\.\d{1,4})?$/.test(estimatedTotal)) return Promise.reject(new Error('El total estimado no tiene el formato requerido.'))
    const body = {
      vessel_id: snapshot.boatId, start_date: snapshot.start, end_date: snapshot.end,
      passengers: snapshot.pax, departure_time: departureTime, estimated_total: estimatedTotal,
      holder: { full_name: contact.name, phone: contact.phone, ...(contact.email ? { email: contact.email } : {}) },
    }
    const signature = JSON.stringify(body)
    if (pending.current) return pending.current
    if (attempt.current?.signature !== signature) attempt.current = { signature, key: crypto.randomUUID() }
    if (attempt.current.reservation) return Promise.resolve(attempt.current.reservation)
    pending.current = createReservation(body, attempt.current.key).then((data) => {
      attempt.current.reservation = data
      setReservation(data)
      return data
    }).finally(() => { pending.current = null })
    return pending.current
  }, [checkout.accepted, checkout.expiresAt, snapshot])

  useEffect(() => {
    saveCheckout(sessionStorageOrNull(), checkout)
  }, [checkout])

  useEffect(() => {
    const update = () => setNow(Date.now())
    const timer = setInterval(update, 1000)
    window.addEventListener('focus', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  const expiresAt = reservation?.ttl_expires_at ? Date.parse(reservation.ttl_expires_at) : checkout.expiresAt
  const left = remainingSeconds(expiresAt, now)
  const canContinue = () => checkout.accepted && Date.now() < expiresAt
  const setAccepted = (accepted) => {
    if (Date.now() >= checkout.expiresAt) return
    setCheckout((current) => ({ ...current, accepted }))
  }

  return (
    <CheckoutContext.Provider value={{
      boat, selection, quotation: snapshot.quotation, checkoutId: checkout.id,
      reservationId: reservation?.reservation_id, createReservation: create,
      expiresAt, accepted: checkout.accepted,
      setAccepted, left, expired: left === 0, canContinue,
    }}>
      <Outlet />
    </CheckoutContext.Provider>
  )
}

export default function CheckoutLayout() {
  const { boatId } = useParams()
  const [params] = useSearchParams()
  const { data: boat, isPending, error } = useBoat(boatId)
  const selection = readPaymentSelection(params, boat?.passengers)
  const startDate = selection ? toISO(selection.start) : ''
  const endDate = selection ? toISO(selection.end) : ''
  const pax = selection?.pax
  const { data: quotation, error: quotationError, isFetching } = useQuery({
    queryKey: ['m2', 'quotation', boatId, startDate, endDate, pax],
    queryFn: () => getQuotation(boatId, startDate, endDate, pax),
    enabled: Boolean(selection), staleTime: 0, retry: false, refetchOnWindowFocus: false, refetchOnReconnect: false,
  })
  const invalid = !isPending && (!boat || !selection)

  useEffect(() => {
    if (invalid) {
      try { sessionStorageOrNull()?.removeItem(CHECKOUT_STORAGE_KEY) } catch { /* Storage bloqueado. */ }
    }
  }, [invalid])

  if (error) return <p role="alert" className={styles.state}>{error.message}</p>
  if (isPending) return <p className={styles.state}>Cargando…</p>
  if (invalid) return <p className={styles.state}>Total estimado: <br />Elige fechas y pasajeros para ver el total estimado</p>
  if (quotationError) return <p role="alert" className={styles.state}>{quotationError.message}</p>
  if (isFetching || !quotation) return <p className={styles.state}>Cargando…</p>

  const snapshot = {
    boatId,
    start: toISO(selection.start),
    end: toISO(selection.end),
    pax: selection.pax,
    quotation,
  }

  // Un cambio en la selección o cotización invalida el consentimiento anterior.
  return <CheckoutSession key={JSON.stringify(snapshot)} boat={boat} selection={selection} snapshot={snapshot} />
}
