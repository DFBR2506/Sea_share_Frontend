import { NavLink } from 'react-router-dom'
import { cx } from '@/lib/cx'
import styles from './SubTabs.module.css'

/** Píldora secundaria (Balance General · Historial de Pagos). items: [{to,label,shortLabel?}] */
export function SubTabs({ items, ariaLabel = 'Subnavegación' }) {
  return (
    <nav className={styles.tabs} aria-label={ariaLabel}>
      {items.map(({ to, label }) => (
        <NavLink key={to} to={to} className={({ isActive }) => cx(styles.tab, isActive && styles.active)}>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
