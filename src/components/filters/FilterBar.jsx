import styles from './FilterBar.module.css'

/**
 * Barra de filtros de Explorar: fechas · pasajeros · tipos (multi-selección) · "+ Filtros".
 * types: [{value,label}], selectedTypes: string[]
 */
export function FilterBar({ dates, passengers, types = [], selectedTypes = [], onDatesClick, onPassengersClick, onToggleType, onMoreFilters }) {
  return (
    <div className={styles.bar} role="group" aria-label="Filtros">
      <button type="button" className={styles.segment} onClick={onDatesClick}>
        <strong>Fechas</strong> {dates}
      </button>
      <span className={styles.divider} />
      <button type="button" className={styles.segment} onClick={onPassengersClick}>
        <strong>Pasajeros</strong> {passengers}
      </button>
      <span className={styles.divider} />
      {types.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={styles.chip}
          aria-pressed={selectedTypes.includes(value)}
          onClick={() => onToggleType?.(value)}
        >
          {label}
        </button>
      ))}
      <button type="button" className={styles.more} onClick={onMoreFilters}>+ Filtros</button>
    </div>
  )
}
