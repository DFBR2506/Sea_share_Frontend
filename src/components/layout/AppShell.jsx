import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useSession } from '@/lib/sessionContext'
import { OWNER_FINANCE_SUBNAV } from './navConfig'
import { TopBar } from './TopBar'
import styles from './AppShell.module.css'

/** Layout por rol: redirige a /login si no hay sesión o el rol no corresponde. */
export function AppShell({ role, tinted = false }) {
  const { role: current, logout } = useSession()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const isTinted = tinted && !pathname.startsWith('/owner/finanzas')

  if (current !== role) return <Navigate to="/login" replace />

  const subItems = role === 'OWNER' && pathname.startsWith('/owner/finanzas') ? OWNER_FINANCE_SUBNAV : undefined

  return (
    <>
      <TopBar
        role={role}
        subItems={subItems}
        onProfileClick={() => { logout(); navigate('/login') }}
      />
      <main className={isTinted ? `${styles.content} ${styles.tinted}` : styles.content}>
        {isTinted ? <div className={styles.inner}><Outlet /></div> : <Outlet />}
      </main>
    </>
  )
}
