import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cx } from '@/lib/cx'
import styles from './Modal.module.css'

/** Modal base: cierre con ESC / clic en overlay, foco inicial dentro del diálogo. */
export function Modal({ open, onClose, title, subtitle, icon, tone = 'default', children, footer }) {
  const titleId = useId()
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    dialogRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className={styles.overlay} onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={styles.dialog}
      >
        <div className={styles.header}>
          {icon && <span className={cx(styles.icon, tone === 'danger' && styles.iconDanger)}>{icon}</span>}
          <div className={styles.titles}>
            <h2 id={titleId} className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
        <div className={styles.body}>{children}</div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
