import { cx } from '@/lib/cx'
import styles from './StatusBadge.module.css'

/** tone: pending | confirmed | ongoing | completed | canceled (estados de reserva) · success | neutral | warning | danger (genéricos) */
export function StatusBadge({ tone = 'success', className, children }) {
  return <span className={cx(styles.badge, styles[tone], className)}>{children}</span>
}
