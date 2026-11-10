import { StatusBadge } from '@/components/ui'
import { cx } from '@/lib/cx'
import styles from './ReservationItem.module.css'

/** status: { label, tone } con tone ∈ success | neutral | warning | danger */
export function ReservationItem({ title, dates, status, imageUrl, onClick }) {
  return (
    <article className={cx(styles.item, onClick && styles.clickable)} onClick={onClick}>
      {imageUrl ? <img src={imageUrl} alt="" className={styles.thumb} /> : <div className={styles.thumb} />}
      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.dates}>{dates}</p>
      </div>
      {status && <StatusBadge tone={status.tone}>{status.label}</StatusBadge>}
    </article>
  )
}
