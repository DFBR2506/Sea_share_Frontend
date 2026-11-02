import styles from './FinanceUI.module.css'

/** Chips de selección única. options: [{value,label}]; value '' = Todos. */
export function FilterChips({ label, options, value, onChange }) {
  return (
    <div className={styles.panel}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.chips} role="group" aria-label={label}>
        {options.map((o) => (
          <button key={o.value} type="button" className={styles.chip} aria-pressed={value === o.value} onClick={() => onChange(o.value)}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}
