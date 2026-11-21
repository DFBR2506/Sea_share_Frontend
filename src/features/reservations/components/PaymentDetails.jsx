import { useRef, useState } from 'react'
import { Button, Input } from '@/components/ui'
import { useCheckout } from '../checkout/checkoutContext'
import { PHONE_DIGITS, contactErrors, sanitizePhone } from '../checkout/paymentContract'
import { departureError, minimumDepartureTime } from '../checkout/departure'
import { toISO } from '@/lib/dates'
import PaymentBrick from './PaymentBrick'
import styles from '../pages/pages.module.css'

function ContactForm({ initial, onContinue }) {
  const { canContinue, createReservation, boat, selection, now, departureTime: savedDepartureTime } = useCheckout()
  const [contact, setContact] = useState(initial ?? { name: '', phone: '' })
  const [touched, setTouched] = useState(false)
  const [departureTime, setDepartureTime] = useState(savedDepartureTime ?? '')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)
  const pending = useRef(false)
  const form = useRef(null)
  const errors = contactErrors(contact)
  const timeError = departureError(toISO(selection.start), departureTime, boat.timezone, now)

  const submit = async (event) => {
    event.preventDefault()
    if (pending.current) return
    setTouched(true)
    const invalid = Object.keys(errors).find((key) => errors[key])
    if (invalid) {
      form.current.elements.namedItem(invalid)?.focus()
      return
    }
    if (departureError(toISO(selection.start), departureTime, boat.timezone) || !canContinue()) {
      form.current.elements.namedItem('departureTime')?.focus()
      return
    }
    const value = { name: contact.name.trim(), phone: contact.phone.trim() }
    pending.current = true
    setBusy(true)
    setError(null)
    try {
      await createReservation(value, departureTime)
      onContinue(value)
    } catch (cause) {
      setError(cause)
    } finally {
      pending.current = false
      setBusy(false)
    }
  }

  return (
    <form ref={form} onSubmit={submit} noValidate className={styles.contactForm}>
      <p className={styles.muted}>Estos datos son del contacto de la reserva, que puede ser distinto del titular de la tarjeta. Usa datos de prueba.</p>
      <div className={styles.formRow}>
        <Input label="Nombre completo del contacto *" name="name" autoComplete="name" required
          value={contact.name} onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))}
          error={touched && errors.name} />
        {/* Sin maxLength: el navegador truncaría un pegado con +57 antes de poder quitar el indicativo. */}
        <Input label="Teléfono de contacto *" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" required
          placeholder={`${PHONE_DIGITS} dígitos, p. ej. 3001234567`}
          value={contact.phone} onChange={(event) => setContact((current) => ({ ...current, phone: sanitizePhone(event.target.value) }))}
          error={touched && errors.phone} />
      </div>
      <Input label="Hora de salida *" name="departureTime" type="time" required value={departureTime}
        min={minimumDepartureTime(toISO(selection.start), boat.timezone, now)} step="60"
        onChange={(event) => setDepartureTime(event.target.value)} error={(touched || departureTime) && timeError} />
      <p className={styles.muted}>Hora del puerto ({boat.timezone}). Al continuar se inicia una reserva sin pagar, que puedes descartar al salir.</p>
      {error && <p role="alert">{error.message}</p>}
      <p className={styles.payNote}>El correo del pagador y los datos de tarjeta se completan únicamente en el formulario seguro de MercadoPago.</p>
      <Button type="submit" disabled={busy || !departureTime || Boolean(timeError)}>Continuar al formulario seguro</Button>
    </form>
  )
}

export default function PaymentDetails() {
  const { expired, reservationId } = useCheckout()
  const [contact, setContact] = useState(null)
  const [editing, setEditing] = useState(true)

  if (!import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY?.trim()) return <p role="alert">Configura la Public Key de Mercado Pago antes de iniciar la reserva. No se crearán reservas ni pagos con tokens ficticios.</p>

  if (expired && !reservationId) return null
  if (editing) return <ContactForm initial={contact} onContinue={(value) => { setContact(value); setEditing(false) }} />

  return (
    <div className={styles.paymentDetails}>
      <div>
        <p className={styles.muted}>Contacto de la reserva: {contact.name} · {contact.phone}</p>
        <Button variant="secondary" onClick={() => setEditing(true)}>Editar contacto</Button>
        <p className={styles.payNote}>Editar el contacto borra el formulario seguro y cualquier token capturado. El tiempo disponible no se reinicia.</p>
      </div>
      <PaymentBrick contact={contact} />
    </div>
  )
}
