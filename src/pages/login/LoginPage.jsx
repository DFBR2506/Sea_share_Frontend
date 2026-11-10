import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FloatingInput, SmoothButton } from '@/components/ui'
import { cx } from '@/lib/cx'
import { HOME_BY_ROLE } from '@/lib/roles'
import { useSession } from '@/lib/sessionContext'
import { LoginBackground } from './LoginBackground'
import { LOGO_PATH } from './logoPath'
import styles from './LoginPage.module.css'

const ROLE_BUTTONS = [
  { role: 'OWNER', label: 'Entrar como Propietario', alt: false },
  { role: 'RENTER', label: 'Entrar como Arrendatario', alt: false },
  { role: 'ADMIN', label: 'Entrar como Administrador', alt: true },
  { role: 'FINADMIN', label: 'Entrar como Admin Financiero', alt: true },
]

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 6

export default function LoginPage() {
  const { role, login } = useSession()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ email: false, password: false })

  if (role) return <Navigate to={HOME_BY_ROLE[role]} replace />

  const emailError = !email.trim() ? 'Ingresa tu correo' : !EMAIL_RE.test(email) ? 'Correo no válido' : ''
  const passwordError = !password ? 'Ingresa tu contraseña' : password.length < MIN_PASSWORD ? `Mínimo ${MIN_PASSWORD} caracteres` : ''
  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }))

  const submit = (e) => {
    e.preventDefault()
    setTouched({ email: true, password: true })
  }

  const enter = (next) => {
    login(next)
    navigate(HOME_BY_ROLE[next])
  }

  return (
    <div className={styles.page}>
      <LoginBackground />
      <main className={styles.slot}>
        <div className={styles.card}>
          <div className={styles.head}>
            <svg className={styles.logo} viewBox="36.35 76.55 140 140" role="img" aria-label="SeaShare">
              <path fill="currentColor" d={LOGO_PATH} />
            </svg>
            <span className={styles.brand}>SEASHARE</span>
            <h1>Bienvenido a bordo</h1>
            <p>Inicia sesión para reservar tu lancha.</p>
          </div>

          <form className={styles.form} noValidate onSubmit={submit}>
            <FloatingInput id="login-email" label="Correo" type="email" value={email} error={touched.email ? emailError : ''} onBlur={() => touch('email')} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            <FloatingInput id="login-pass" label="Contraseña" type="password" value={password} error={touched.password ? passwordError : ''} onBlur={() => touch('password')} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            <SmoothButton type="submit" variant="candy" size="lg" className={styles.submit}>Iniciar sesión</SmoothButton>
          </form>

          <div className={styles.links}>
            <a href="#" onClick={(e) => e.preventDefault()}>¿Olvidaste tu contraseña?</a>
            <a href="#" className={styles.strong} onClick={(e) => e.preventDefault()}>Crear cuenta</a>
          </div>

          <div className={styles.roleBlock}>
            <p className={styles.choose}>Elige el acceso para continuar</p>
            <div className={styles.roles}>
              {ROLE_BUTTONS.map(({ role: r, label, alt }) => (
                <SmoothButton key={r} variant="candy" className={cx(styles.role, alt && styles.roleAlt)} onClick={() => enter(r)}>
                  {label}
                </SmoothButton>
              ))}
            </div>
            <p className={styles.footer}>Prototipo navegable · Usa los botones para explorar cada rol.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
