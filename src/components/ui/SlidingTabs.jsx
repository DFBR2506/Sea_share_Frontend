import { useLayoutEffect, useRef, useState } from 'react'
import { cx } from '@/lib/cx'
import styles from './SlidingTabs.module.css'

/**
 * Selector de una opción con indicador azul que se desliza (mismo efecto que la navbar flotante).
 * items: [{ value, label }]. Controlado con `value` / `onChange(value)`.
 */
export function SlidingTabs({ items, value, onChange, ariaLabel, role = 'group', className }) {
  const listRef = useRef(null)
  const [indicator, setIndicator] = useState(null)
  const isTabs = role === 'tablist'

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => {
      const active = list.querySelector('[data-active="true"]')
      setIndicator(active ? { left: active.offsetLeft, width: active.offsetWidth } : null)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [value, items])

  return (
    <div ref={listRef} className={cx(styles.list, className)} role={role} aria-label={ariaLabel}>
      {indicator && <span aria-hidden="true" className={styles.indicator} style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }} />}
      {items.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role={isTabs ? 'tab' : undefined}
            aria-selected={isTabs ? active : undefined}
            aria-pressed={isTabs ? undefined : active}
            data-active={active}
            className={cx(styles.item, active && styles.active)}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
