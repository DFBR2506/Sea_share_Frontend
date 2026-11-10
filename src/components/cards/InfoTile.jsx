import styles from './InfoTile.module.css'

/** Dato con etiqueta en mayúsculas (matrícula, tipo, tarifa…). */
export function InfoTile({ label, value, sub, className }) {
  return (
    <div className={`${styles.tile} ${className ?? ''}`}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>{value}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </div>
  )
}
