import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import closeIcon from '@/assets/icons/close.svg'
import { cx } from '@/lib/cx'
import styles from './Modal.module.css'

/** Modal base: cierre con ESC / clic en overlay, foco inicial dentro del diálogo. */
export function Modal({ open, onClose, title, subtitle, icon, tone = 'default', size = 'md', variant = 'default', children, footer }) {
  const titleId = useId()
  const dialogRef = useRef(null)
  // Mantiene el diálogo montado mientras corre la animación de salida.
  const [mounted, setMounted] = useState(open)
  const closing = mounted && !open
  if (open && !mounted) setMounted(true)

  useEffect(() => {
    if (open) return
    const timer = setTimeout(() => setMounted(false), 300)
    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    dialogRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    const { overflow, paddingRight } = document.body.style
    // Compensa el ancho de la barra de scroll para que el fondo no se desplace al abrir.
    const scrollbar = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      document.body.style.paddingRight = paddingRight
      previous?.focus?.()
    }
  }, [open, onClose])

  if (!open && !mounted) return null

  return createPortal(
    <div className={cx(styles.overlay, closing && styles.closing)} onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(styles.dialog, size === 'lg' && styles.wide, variant === 'alert' && styles.alert)}
      >
        <div className={cx(styles.header, variant === 'alert' && styles.headerAlert)}>
          {icon && <span className={cx(styles.icon, tone === 'danger' && styles.iconDanger)}>{icon}</span>}
          <div className={styles.titles}>
            <h2 id={titleId} className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          {variant !== 'alert' && <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar"><img src={closeIcon} alt="" width="18" height="18" /></button>}
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
