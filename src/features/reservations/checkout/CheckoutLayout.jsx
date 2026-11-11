import { useEffect, useState } from 'react'
import { Outlet, useParams, useSearchParams } from 'react-router-dom'
import { toISO } from '@/lib/dates'
import { priceBreakdown } from '../api'
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

  const left = remainingSeconds(checkout.expiresAt, now)
  const canContinue = () => checkout.accepted && Date.now() < checkout.expiresAt
  const setAccepted = (accepted) => {
    if (Date.now() >= checkout.expiresAt) return
    setCheckout((current) => ({ ...current, accepted }))
  }

  return (
    <CheckoutContext.Provider value={{
      boat, selection, price: snapshot.price, checkoutId: checkout.id,
      expiresAt: checkout.expiresAt, accepted: checkout.accepted,
      setAccepted, left, expired: left === 0, canContinue,
    }}>
      <Outlet />
    </CheckoutContext.Provider>
  )
}

export default function CheckoutLayout() {
  const { boatId } = useParams()
  const [params] = useSearchParams()
  const { data: boat, isPending } = useBoat(boatId)
  const selection = readPaymentSelection(params, boat?.passengers)
  const invalid = !isPending && (!boat || !selection)

  useEffect(() => {
    if (invalid) {
      try { sessionStorageOrNull()?.removeItem(CHECKOUT_STORAGE_KEY) } catch { /* Storage bloqueado. */ }
    }
  }, [invalid])

  if (isPending) return <p className={styles.state}>Cargando…</p>
  if (invalid) return <p className={styles.state}>La reserva no es válida. Vuelve a elegir tus fechas.</p>

  const snapshot = {
    boatId,
    start: toISO(selection.start),
    end: toISO(selection.end),
    pax: selection.pax,
    price: priceBreakdown(boat.pricePerDay, selection.start, selection.end, selection.pax),
  }

  // Un cambio en la selección o cotización invalida el consentimiento anterior.
  return <CheckoutSession key={JSON.stringify(snapshot)} boat={boat} selection={selection} snapshot={snapshot} />
}
