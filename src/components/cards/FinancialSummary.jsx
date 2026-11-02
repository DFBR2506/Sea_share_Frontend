import styles from './FinancialSummary.module.css'

export function FinancialSummary({ label, value, delta }) {
  return (
    <section className={styles.card}>
      <p className={styles.label}>{label}</p>
      <p className={styles.value}>{value}</p>
      {delta && <p className={styles.delta}>{delta}</p>}
    </section>
  )
}
