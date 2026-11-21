import { InfoTile } from '@/components/cards'
import { Chip } from '@/components/ui'
import { copMoney } from '@/lib/dates'
import { MANDATORY_SERVICES } from '../constants'
import { formatCapacity, formatCoordinate, typeName } from '../format'
import { MapPicker } from './MapPicker'
import styles from './VesselDetailView.module.css'

/** Ficha de embarcación compartida por Propietario y Administrador. */
export function VesselDetailView({ vessel, servicesNote }) {
  const hasPoint = vessel.port.lat !== '' && vessel.port.long !== ''
  return (
    <div className={styles.body}>
      <div>
        <div className={styles.photo} role="img" aria-label="Fotografía de la embarcación" style={vessel.photoUrl ? { backgroundImage: `url(${vessel.photoUrl})` } : undefined} data-has-photo={vessel.photoUrl ? '' : undefined} />
        <div className={styles.services}>
          <h2>Servicios y Dotación Incluida</h2>
          <p>{servicesNote}</p>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Obligatorios (base):</span>
            {MANDATORY_SERVICES.map((s) => <Chip key={s}>{s}</Chip>)}
          </div>
          <div className={styles.row}>
            <span className={styles.rowLabel}>Adicionales:</span>
            {vessel.extras.length ? vessel.extras.map((s) => <Chip key={s}>{s}</Chip>) : <span>Sin servicios adicionales seleccionados</span>}
          </div>
        </div>
      </div>
      <div className={styles.tiles}>
        <InfoTile label="Matrícula legal" value={vessel.plate} />
        <InfoTile label="Tipo de embarcación" value={typeName(vessel.type)} />
        <InfoTile label="Capacidad máxima" value={formatCapacity(vessel.capacity)} />
        <InfoTile label="Tarifa base (por día)" value={copMoney(Number(vessel.hourlyRate))} />
        <InfoTile
          className={styles.wide}
          label="Puerto de atraque y ubicación GPS"
          value={vessel.port.name}
          sub={`Lat: ${formatCoordinate(vessel.port.lat)} · Long: ${formatCoordinate(vessel.port.long)}`}
        />
        <div className={styles.wide}>
          {hasPoint
            ? <MapPicker point={vessel.port} label={`Ubicación de ${vessel.port.name || 'el puerto de atraque'} en el mapa`} />
            : <p className={styles.noPoint}>Esta embarcación no tiene coordenadas registradas.</p>}
        </div>
      </div>
    </div>
  )
}
