import { SlidingTabs } from '@/components/ui'
import styles from './FinanceUI.module.css'

/** Selección única con indicador deslizante. options: [{value,label}]; value '' = Todos. */
export function FilterChips({ label, options, value, onChange }) {
  return (
    <div className={styles.panel}>
      <span className={styles.fieldLabel}>{label}</span>
      <SlidingTabs ariaLabel={label} items={options} value={value} onChange={onChange} />
    </div>
  )
}
