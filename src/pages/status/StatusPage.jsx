import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { HOME_BY_ROLE } from '@/lib/roles'
import { useSession } from '@/lib/sessionContext'
import styles from './StatusPage.module.css'

/** Pantalla de aviso a página completa (sin acceso, ruta inexistente). */
export function StatusPage({ code, title, text, icon }) {
  const navigate = useNavigate()
  const { role } = useSession()
  const home = role ? (HOME_BY_ROLE[role] ?? '/') : '/login'

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <span className={styles.icon} aria-hidden="true">{icon}</span>
        <span className={styles.code}>Error {code}</span>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.text}>{text}</p>
        <div className={styles.actions}>
          <Button square onClick={() => navigate(home, { replace: true })}>{role ? 'Ir a mi inicio' : 'Iniciar sesión'}</Button>
        </div>
      </section>
    </main>
  )
}

export function ForbiddenPage() {
  return (
    <StatusPage
      code="403"
      icon="⛔"
      title="No tienes acceso a esta pantalla"
      text="Esta sección pertenece a otro rol de la plataforma. Vuelve a tu inicio para continuar con tus tareas."
    />
  )
}

export function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      icon="🧭"
      title="No encontramos esta página"
      text="La dirección no existe o el contenido se movió. Revisa el enlace o vuelve al inicio."
    />
  )
}
