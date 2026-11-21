import { useState } from 'react'
import boatIcon from '@/assets/icons/boat.svg'
import styles from './VesselPhoto.module.css'

export function VesselPhoto({ src, name = 'Embarcación', className = '' }) {
  const [failedUrl, setFailedUrl] = useState(null)
  return (
    <div className={`${styles.photo} ${className}`}>
      {src && failedUrl !== src
        ? <img className={styles.image} src={src} alt={name} loading="lazy" onError={() => setFailedUrl(src)} />
        : <div className={styles.empty} role="img" aria-label={`Sin foto de ${name}`}>
          <img src={boatIcon} alt="" width="32" height="32" />
          <span>Sin fotos disponibles</span>
        </div>}
    </div>
  )
}
