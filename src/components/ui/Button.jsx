import { cx } from '@/lib/cx'
import styles from './Button.module.css'

export function Button({ variant = 'primary', block = false, square = false, type = 'button', className, ...props }) {
  return (
    <button
      type={type}
      className={cx(styles.button, styles[variant], block && styles.block, square && styles.square, className)}
      {...props}
    />
  )
}
