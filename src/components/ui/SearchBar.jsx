import styles from './SearchBar.module.css'

export function SearchBar({ value, onChange, placeholder = 'Buscar barcos, marina, isla…', onSubmit, ...props }) {
  return (
    <form
      role="search"
      className={styles.search}
      onSubmit={(e) => { e.preventDefault(); onSubmit?.(value) }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <circle cx="7" cy="7" r="5" /><path d="m11 11 3.5 3.5" />
      </svg>
      <input
        type="search"
        className={styles.input}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        {...props}
      />
    </form>
  )
}
