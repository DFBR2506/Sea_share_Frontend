import styles from './MapPlaceholder.module.css'

// Placeholder del mapa interactivo (frame "Prototipo · Mapa" pendiente de implementar).
export function MapPlaceholder({ port }) {
  return (
    <div className={styles.map} role="img" aria-label="Ubicación del puerto de atraque">
      <span className={styles.pin} />
      <div className={styles.caption}>{port.name.split(' (')[0]} — Lat: {port.lat} · Long: {port.long}</div>
    </div>
  )
}
