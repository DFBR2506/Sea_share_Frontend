import styles from './Checkbox.module.css'

export function Checkbox({ label, ...props }) {
  return (
    <label className={styles.box}>
      <input type="checkbox" className={styles.input} {...props} />
      {label}
    </label>
  )
}
