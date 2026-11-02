import { cx } from '@/lib/cx'
import styles from './StatusBadge.module.css'

/** tone: success | neutral | warning | danger */
export function StatusBadge({ tone = 'success', className, children }) {
  return <span className={cx(styles.badge, styles[tone], className)}>{children}</span>
}
