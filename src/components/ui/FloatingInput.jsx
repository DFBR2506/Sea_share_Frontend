import { forwardRef, useId } from 'react'
import { cx } from '@/lib/cx'
import styles from './FloatingInput.module.css'

/**
 * Input con label flotante: el label sube al enfocar o cuando hay texto.
 * Con `error` el borde y el label (que muestra el mensaje) se pintan en rojo.
 * El label flota dentro del campo, sin fondo propio.
 */
export const FloatingInput = forwardRef(function FloatingInput({ id, label, error, className, ...props }, ref) {
  const auto = useId()
  const inputId = id ?? auto
  return (
    <div className={cx(styles.wrap, className)}>
      <input ref={ref} id={inputId} placeholder=" " className={cx(styles.input, error && styles.invalid)} aria-invalid={error ? true : undefined} {...props} />
      <label htmlFor={inputId} className={cx(styles.label, error && styles.labelError)}>{error || label}</label>
    </div>
  )
})
