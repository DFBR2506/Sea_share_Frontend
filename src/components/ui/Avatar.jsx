import styles from './Avatar.module.css'

export function Avatar({ initial, label = 'Perfil' }) {
  return <span className={styles.avatar} aria-label={label}>{initial}</span>
}
