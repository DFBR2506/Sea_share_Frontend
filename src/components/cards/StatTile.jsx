import styles from './StatTile.module.css'

export function StatTile({ value, label }) {
  return (
    <div className={styles.tile}>
      <span className={styles.value}>{value}</span>
      <span className={styles.label}>{label}</span>
    </div>
  )
}

export function StatGrid({ items }) {
  return (
    <div className={styles.grid}>
      {items.map((i) => <StatTile key={i.label} {...i} />)}
    </div>
  )
}
