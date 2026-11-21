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
  { role: 'RENTER', label: 'Entrar como Arrendatario', alt: false },
  { role: 'FINADMIN', label: 'Entrar como Admin Financiero', alt: true },
]

const DOCUMENT_RE = /^\d{1,18}$/

export default function LoginPage() {
  const { role, login, signIn } = useSession()
  const navigate = useNavigate()
  const [document, setDocument] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ document: false, password: false })
  const [submitting, setSubmitting] = useState(false)
  const [failure, setFailure] = useState('')

  if (role) return <Navigate to={HOME_BY_ROLE[role]} replace />

  const documentError = !document.trim() ? 'Ingresa tu número de documento' : !DOCUMENT_RE.test(document.trim()) ? 'Solo dígitos' : ''
  const passwordError = !password ? 'Ingresa tu contraseña' : ''
  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }))

  const submit = async (e) => {
    e.preventDefault()
    setTouched({ document: true, password: true })
    if (documentError || passwordError || submitting) return
    setSubmitting(true)
    setFailure('')
    try {
      const next = await signIn({ documentNumber: document.trim(), password })
      navigate(HOME_BY_ROLE[next])
    } catch (error) {
      setFailure(error.status === 401 ? 'Documento o contraseña incorrectos.' : error.message)
      setSubmitting(false)
    }
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
            <FloatingInput id="login-document" label="Número de documento" inputMode="numeric" value={document} error={touched.document ? documentError : ''} onBlur={() => touch('document')} onChange={(e) => setDocument(e.target.value)} autoComplete="username" />
            <FloatingInput id="login-pass" label="Contraseña" type="password" value={password} error={touched.password ? passwordError : ''} onBlur={() => touch('password')} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            {failure && <p role="alert" className={styles.failure}>{failure}</p>}
            <SmoothButton type="submit" variant="candy" size="lg" className={styles.submit} disabled={submitting}>{submitting ? 'Ingresando…' : 'Iniciar sesión'}</SmoothButton>
          </form>

          <div className={styles.links}>
            <a href="#" onClick={(e) => e.preventDefault()}>¿Olvidaste tu contraseña?</a>
            <a href="#" className={styles.strong} onClick={(e) => e.preventDefault()}>Crear cuenta</a>
          </div>

          <div className={styles.roleBlock}>
            <p className={styles.choose}>Accesos de desarrollo (sin cuenta en backend)</p>
            <div className={styles.roles}>
              {ROLE_BUTTONS.map(({ role: r, label, alt }) => (
                <SmoothButton key={r} variant="candy" className={cx(styles.role, alt && styles.roleAlt)} onClick={() => enter(r)}>
                  {label}
                </SmoothButton>
              ))}
            </div>
            <p className={styles.footer}>Propietarios y administradores ingresan con su documento y contraseña.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
