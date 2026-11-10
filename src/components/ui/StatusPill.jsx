import { cx } from '@/lib/cx'
import styles from './StatusPill.module.css'

/** Estado operativo con punto: tone = ok | warn. */
export function StatusPill({ tone = 'ok', children }) {
  return <span className={cx(styles.pill, styles[tone])}>{children}</span>
}
