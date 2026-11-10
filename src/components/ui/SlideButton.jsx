import { cx } from '@/lib/cx'
import styles from './SlideButton.module.css'

/**
 * Botón con icono: el bloque azul con el icono se expande al pasar el cursor.
 * `tone`: brand (azul) | danger | warning. `icon` es la URL de un svg blanco (import de '@/assets/icons/*.svg').
 */
export function SlideButton({ icon, tone = 'brand', children, type = 'button', className, ...props }) {
  return (
    <button type={type} className={cx(styles.button, tone !== 'brand' && styles[tone], className)} {...props}>
      <span className={styles.icon} aria-hidden="true">
        <img src={icon} alt="" width="20" height="20" />
      </span>
      <span className={styles.label}>{children}</span>
    </button>
  )
}
