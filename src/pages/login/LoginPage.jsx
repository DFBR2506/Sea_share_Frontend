import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui'
import { cx } from '@/lib/cx'
import { HOME_BY_ROLE } from '@/lib/roles'
import { useSession } from '@/lib/sessionContext'
import styles from './LoginPage.module.css'

const ROLE_BUTTONS = [
  { role: 'OWNER', label: 'Entrar como Propietario', alt: false },
  { role: 'RENTER', label: 'Entrar como Arrendatario', alt: false },
  { role: 'ADMIN', label: 'Entrar como Administrador', alt: true },
  { role: 'FINADMIN', label: 'Entrar como Admin Financiero', alt: true },
]

export default function LoginPage() {
  const { role, login } = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (role) return <Navigate to={HOME_BY_ROLE[role]} replace />

  const enter = (next) => {
    login(next)
    navigate(HOME_BY_ROLE[next])
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.brand}><span className={styles.mark}>S</span>SeaShare</div>
        <div className={styles.heroBody}>
          <p className={styles.eyebrow}>PLATAFORMA DE ALQUILER NÁUTICO</p>
          <h2 className={styles.headline}>Tu próxima aventura<br />comienza aquí.</h2>
          <p className={styles.lead}>Gestiona embarcaciones, reservas y finanzas desde un solo lugar.</p>
          <p className={styles.hint}>Selecciona tu perfil para continuar</p>
        </div>
        <p className={styles.copyright}>SeaShare Enterprise Platform © 2026 — Todos los derechos reservados</p>
      </section>

      <section className={styles.panel}>
        <div className={styles.card}>
          <h1>Iniciar sesión</h1>
          <p className={styles.sub}>Ingresa tus credenciales para acceder</p>

          <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
            <Input label="Usuario o correo" type="email" placeholder="usuario@seashare.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            <Input label="Contraseña" type="password" placeholder="••••••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <a href="#" className={styles.forgot} onClick={(e) => e.preventDefault()}>¿Olvidaste tu contraseña?</a>
          </form>

          <p className={styles.choose}>Elige el acceso para continuar</p>
          <div className={styles.roles}>
            {ROLE_BUTTONS.map(({ role: r, label, alt }) => (
              <button key={r} type="button" className={cx(styles.role, alt && styles.roleAlt)} onClick={() => enter(r)}>
                {label}
              </button>
            ))}
          </div>
          <p className={styles.footer}>Prototipo navegable · Usa los botones para explorar cada rol.</p>
        </div>
      </section>
    </div>
  )
}
