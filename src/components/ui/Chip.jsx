import styles from './Chip.module.css'

export function Chip({ children }) {
  return <span className={styles.chip}>{children}</span>
}
