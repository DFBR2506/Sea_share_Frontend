import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cx } from '@/lib/cx'
import styles from './FloatingNavbar.module.css'

const SHRINK_AFTER = 80
const HIDE_DELTA = 6

/**
 * Navbar flotante tipo píldora con indicador deslizante.
 * Se encoge tras `SHRINK_AFTER` px de scroll, se oculta al bajar y reaparece al subir.
 * `embedded`: va dentro de la topbar (sin posición fija, ni encoger/ocultar).
 * items: [{ to, label, icon?, end? }]. El item activo sale de la ruta.
 */
export function FloatingNavbar({ items, ariaLabel = 'Principal', embedded = false }) {
  const { pathname } = useLocation()
  const listRef = useRef(null)
  const [indicator, setIndicator] = useState(null)
  const [shrunk, setShrunk] = useState(false)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (embedded) return
    let last = window.scrollY
    const onScroll = () => {
      const y = window.scrollY
      setShrunk(y > SHRINK_AFTER)
      if (Math.abs(y - last) > HIDE_DELTA) {
        setHidden(y > last && y > SHRINK_AFTER)
        last = y
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [embedded])

  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => {
      const active = list.querySelector('[aria-current="page"]')
      setIndicator(active ? { left: active.offsetLeft, width: active.offsetWidth } : null)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(list)
    return () => observer.disconnect()
  }, [pathname, shrunk, items])

  return (
    <nav
      aria-label={ariaLabel}
      className={cx(styles.nav, embedded && styles.embedded, shrunk && styles.shrunk, hidden && styles.hidden)}
    >
      <div ref={listRef} className={styles.list}>
        {indicator && (
          <span
            aria-hidden="true"
            className={styles.indicator}
            style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
          />
        )}
        {items.map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => cx(styles.item, isActive && styles.active)}>
            {icon && <img src={icon} alt="" className={styles.icon} />}
            <span className={styles.label}>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
