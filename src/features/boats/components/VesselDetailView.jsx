import { InfoTile } from '@/components/cards'
import { Chip } from '@/components/ui'
import { copMoney } from '@/lib/dates'
import { MANDATORY_SERVICES } from '../api/mocks'
import styles from './VesselDetailView.module.css'

/** Ficha de embarcación compartida por Propietario y Administrador. */
export function VesselDetailView({ vessel, servicesNote }) {
  return (
    <div className={styles.body}>
      <div>
        <div className={styles.photo} role="img" aria-label="Fotografía de la embarcación" />
        <div className={styles.services}>
          <h2>Servicios y Dotación Incluida</h2>
          <p>{servicesNote}</p>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Obligatorios (base):</span>
            {MANDATORY_SERVICES.map((s) => <Chip key={s}>{s}</Chip>)}
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Adicionales:</span>
            {vessel.extras.length ? vessel.extras.map((s) => <Chip key={s}>{s}</Chip>) : <span>Ninguno</span>}
          </div>
        </div>
      </div>
      <div className={styles.tiles}>
        <InfoTile label="Matrícula legal" value={vessel.plate} />
        <InfoTile label="Tipo de embarcación" value={vessel.type} />
        <InfoTile label="Capacidad máxima" value={`${vessel.capacity} Pasajeros`} />
        <InfoTile label="Tarifa base (por hora)" value={copMoney(vessel.hourlyRate)} />
        <InfoTile className={styles.wide} label="Puerto de atraque y ubicación GPS" value={vessel.port.name} sub={`Lat: ${vessel.port.lat}, Long: ${vessel.port.long}`} />
      </div>
    </div>
  )
}
