import { useEffect, useState } from 'react'
import { Outlet, useParams, useSearchParams } from 'react-router-dom'
import { toISO } from '@/lib/dates'
import { m3ErrorMessage } from '@/features/finance/errors'
import { useEstimate } from '@/features/finance/hooks'
import { boatUuid } from '../api'
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
  // UC02 · el precio del checkout es la estimación de M3 para la selección (sin depósito: lo
  // calcula UC04 cuando M2 registre la reserva). Nunca se usan importes simulados.
  const uuid = boatUuid(boatId)
  const estimate = useEstimate({
    boatId: uuid,
    startDate: selection ? toISO(selection.start) : '',
    endDate: selection ? toISO(selection.end) : '',
    passengers: selection?.pax ?? 0,
  })

  useEffect(() => {
    if (invalid) {
      try { sessionStorageOrNull()?.removeItem(CHECKOUT_STORAGE_KEY) } catch { /* Storage bloqueado. */ }
    }
  }, [invalid])

  if (isPending) return <p className={styles.state}>Cargando…</p>
  if (invalid) return <p className={styles.state}>La reserva no es válida. Vuelve a elegir tus fechas.</p>
  if (!uuid) return <p className={styles.state}>Esta embarcación no tiene precio disponible en finanzas; no es posible continuar con el pago.</p>
  // Un precio ya obtenido manda: un fallo de un refresco en segundo plano no desmonta el pago.
  if (!estimate.data) {
    return estimate.isError
      ? <p className={styles.state} role="alert">No se pudo calcular el precio de la reserva: {m3ErrorMessage(estimate.error)}</p>
      : <p className={styles.state}>Calculando el precio…</p>
  }

  const snapshot = {
    boatId,
    start: toISO(selection.start),
    end: toISO(selection.end),
    pax: selection.pax,
    price: { days: estimate.data.durationDays, total: estimate.data.total, warning: estimate.data.warning },
  }

  // Un cambio en la selección o cotización invalida el consentimiento anterior.
  return <CheckoutSession key={JSON.stringify(snapshot)} boat={boat} selection={selection} snapshot={snapshot} />
}
