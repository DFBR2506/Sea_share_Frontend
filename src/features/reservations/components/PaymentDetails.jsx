import { useRef, useState } from 'react'
import { Button, Input } from '@/components/ui'
import { useCheckout } from '../checkout/checkoutContext'
import { contactErrors } from '../checkout/paymentContract'
import PaymentBrick from './PaymentBrick'
import styles from '../pages/pages.module.css'

function ContactForm({ initial, onContinue }) {
  const { canContinue } = useCheckout()
  const [contact, setContact] = useState(initial ?? { name: '', phone: '' })
  const [touched, setTouched] = useState(false)
  const form = useRef(null)
  const errors = contactErrors(contact)

  const submit = (event) => {
    event.preventDefault()
    setTouched(true)
    const invalid = Object.keys(errors).find((key) => errors[key])
    if (invalid) {
      form.current.elements.namedItem(invalid)?.focus()
      return
    }
    if (canContinue()) onContinue({ name: contact.name.trim(), phone: contact.phone.trim() })
  }

  return (
    <form ref={form} onSubmit={submit} noValidate className={styles.contactForm}>
      <p className={styles.muted}>Estos datos son del contacto de la reserva, que puede ser distinto del titular de la tarjeta. Usa datos de prueba.</p>
      <div className={styles.formRow}>
        <Input label="Nombre completo del contacto *" name="name" autoComplete="name" required
          value={contact.name} onChange={(event) => setContact((current) => ({ ...current, name: event.target.value }))}
          error={touched && errors.name} />
        <Input label="Teléfono de contacto *" name="phone" type="tel" inputMode="tel" autoComplete="tel" required
          value={contact.phone} onChange={(event) => setContact((current) => ({ ...current, phone: event.target.value }))}
          error={touched && errors.phone} />
      </div>
      <p className={styles.payNote}>El correo del pagador y los datos de tarjeta se completan únicamente en el formulario seguro de MercadoPago.</p>
      <Button type="submit">Continuar al formulario seguro</Button>
    </form>
  )
}

export default function PaymentDetails() {
  const { expired } = useCheckout()
  const [contact, setContact] = useState(null)
  const [editing, setEditing] = useState(true)

  if (expired) return null
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
