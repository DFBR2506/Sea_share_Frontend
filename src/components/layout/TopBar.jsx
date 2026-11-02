import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import menuIcon from '@/assets/icons/menu.svg'
import { Avatar } from '@/components/ui'
import { cx } from '@/lib/cx'
import { NAV_BY_ROLE } from './navConfig'
import { SubTabs } from './SubTabs'
import styles from './TopBar.module.css'

/**
 * Barra superior por rol (ADMIN | OWNER | RENTER | FINADMIN).
 * El item activo sale de la ruta; `subItems` muestra la píldora secundaria (Finanzas del Owner).
 */
export function TopBar({ role, subItems, brandTo = '/', sticky = true }) {
  const [open, setOpen] = useState(false)
  const { items, initial, subtitle, plain } = NAV_BY_ROLE[role]

  return (
    <header className={cx(styles.bar, !sticky && styles.static)}>
      <div className={styles.main}>
        <div className={styles.left}>
          <button
            type="button"
            className={styles.menuButton}
            aria-label="Menú"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <img src={menuIcon} alt="" width="20" height="20" />
          </button>
          <Link to={brandTo} className={styles.brand}>
            <span className={styles.logo}>SEA-SHARE</span>
            {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
          </Link>
        </div>

        <div className={styles.profile}>
          <span>Perfil</span>
          {initial && <Avatar initial={initial} />}
        </div>

        <nav className={cx(styles.nav, open && styles.open)} aria-label="Principal">
          {items.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cx(styles.item, plain && styles.plain, isActive && styles.active)}
            >
              {icon && <img src={icon} alt="" className={styles.icon} />}
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {subItems && (
        <div className={styles.sub}>
          <SubTabs items={subItems} />
        </div>
      )}
    </header>
  )
}
