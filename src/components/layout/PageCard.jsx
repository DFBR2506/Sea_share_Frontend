import { useNavigate } from 'react-router-dom'
import styles from './PageCard.module.css'

export function BackButton({ to }) {
  const navigate = useNavigate()
  return <button type="button" className={styles.back} onClick={() => navigate(to ?? -1)}>← Volver</button>
}

/** Tarjeta blanca de contenido (sobre el fondo degradado de M1). */
export function PageCard({ children, maxWidth }) {
  return <section className={styles.card} style={maxWidth ? { maxWidth, marginInline: 'auto' } : undefined}>{children}</section>
}

export function PageCardHead({ title, subtitle, badge, actions }) {
  return (
    <header className={styles.head}>
      <div className={styles.heading}>
        <div>
          <h1 className={styles.title}>{title}</h1>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {badge}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  )
}
