import styles from './Toggle.module.css'

export function Toggle({ checked, onChange, label, ...props }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      className={styles.toggle}
      onClick={() => onChange?.(!checked)}
      {...props}
    />
  )
}
