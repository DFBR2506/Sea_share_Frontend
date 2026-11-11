import { useCheckout } from './checkoutContext'
import styles from '../pages/pages.module.css'

export default function CheckoutTimer() {
  const { left, expired } = useCheckout()
  const clock = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`

  return (
    <>
      <div className={`${styles.timer} ${expired ? styles.expired : ''}`} role="timer" aria-label="Tiempo restante del checkout">
        {expired ? 'EL TIEMPO DEL CHECKOUT EXPIRÓ' : `TIEMPO PARA COMPLETAR: ${clock}`}
      </div>
      <p className={styles.muted}>Ventana de pago simulada. El precio y la disponibilidad no están bloqueados.</p>
      {expired && <p className={styles.payNote} role="alert">El plazo terminó. Vuelve a la embarcación para iniciar una nueva selección.</p>}
    </>
  )
}
