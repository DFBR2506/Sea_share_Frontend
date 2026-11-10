import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '@/lib/sessionContext'
import { OWNER_FINANCE_SUBNAV } from './navConfig'
import { FloatingNavbar } from './FloatingNavbar'
import { TopBar } from './TopBar'
import styles from './AppShell.module.css'

/** Layout por rol: redirige a /login si no hay sesión o el rol no corresponde. */
export function AppShell({ role }) {
  const { role: current, logout } = useSession()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  if (current !== role) return <Navigate to="/login" replace />

  const handleLogout = () => { logout(); navigate('/login') }
  // En Finanzas del Owner, la subnavegación va en la navbar flotante.
  const subItems = role === 'OWNER' && pathname.startsWith('/owner/finanzas') ? OWNER_FINANCE_SUBNAV : undefined

  // Todos los roles: topbar azul con "Cerrar sesión" y fondo brand-soft.
  return (
    <>
      <TopBar role={role} onLogout={handleLogout} />
      <main className={`${styles.content} ${styles.owner} ${subItems ? styles.withFloat : ''}`}>
        <div className={styles.inner}>
          <Outlet />
        </div>
      </main>
      {subItems && <FloatingNavbar items={subItems} ariaLabel="Finanzas" />}
    </>
  )
}
