import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Button } from '@/components/ui'
import { roundCoordinate } from '../validation'
import styles from './MapPicker.module.css'

// Vista inicial del mapa: Santa Marta. Con un punto ya guardado se abre encuadrado en él.
const INITIAL_VIEW = { center: [11.2408, -74.199], zoom: 12 }
const SAVED_POINT_ZOOM = 15
const TILES = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
const MAP_ERROR = 'No se pudo cargar el mapa. Verifica tu conexión a internet e inténtalo nuevamente.'

const dot = () => L.divIcon({ className: styles.dot, iconSize: [20, 20] })
const isPoint = (p) => p != null && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.long)) && p.lat !== '' && p.long !== ''
const latLngOf = (p) => [Number(p.lat), Number(p.long)]

/**
 * Mapa de coordenadas del puerto de atraque. Con `onSelect` el propietario hace clic o arrastra el
 * marcador y recibe { lat, long } redondeados a 4 decimales (la longitud fuera de rango se
 * normaliza: 190 pasa a -170). Sin `onSelect` el mapa es solo de lectura (ficha de la embarcación).
 */
export function MapPicker({ point, onSelect, label = 'Ubicación del puerto de atraque' }) {
  const canvasRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const selectRef = useRef(onSelect)
  const [failed, setFailed] = useState(false)
  const [attempt, setAttempt] = useState(0)
  // Encuadre de partida: se calcula una sola vez para que escribir no mueva el mapa bajo el dedo.
  const [view] = useState(() => (isPoint(point) ? { center: latLngOf(point), zoom: SAVED_POINT_ZOOM } : INITIAL_VIEW))
  const readOnly = !onSelect

  useEffect(() => { selectRef.current = onSelect }, [onSelect])

  // El mapa se crea una vez (y de nuevo al reintentar); el marcador lo coloca el efecto de abajo.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    setFailed(false)
    const map = L.map(canvas, {
      attributionControl: !readOnly,
      scrollWheelZoom: !readOnly,
      zoomControl: !readOnly,
    })
    map.setView(view.center, view.zoom)
    mapRef.current = map

    let tilesLoaded = false
    const layer = L.tileLayer(TILES, { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map)
    layer.on('tileload', () => { tilesLoaded = true })
    layer.on('tileerror', () => { if (!tilesLoaded) setFailed(true) })

    if (!readOnly) {
      map.on('click', (event) => {
        const wrapped = event.latlng.wrap()
        if (!Number.isFinite(wrapped.lat) || !Number.isFinite(wrapped.lng)) return
        selectRef.current?.({ lat: roundCoordinate(wrapped.lat), long: roundCoordinate(wrapped.lng) })
      })
    }

    // El contenedor acaba de montarse: se remide para que las teselas cubran todo el alto.
    const timer = setTimeout(() => map.invalidateSize(), 0)
    return () => {
      clearTimeout(timer)
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [attempt, readOnly, view])

  // Coordenadas elegidas o recibidas desde fuera: colocan y mueven el marcador.
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isPoint(point)) return
    const latlng = latLngOf(point)
    if (markerRef.current) return markerRef.current.setLatLng(latlng)
    const marker = L.marker(latlng, { draggable: !readOnly, icon: dot(), keyboard: false }).addTo(map)
    if (!readOnly) {
      marker.on('dragend', () => {
        const wrapped = marker.getLatLng().wrap()
        if (!Number.isFinite(wrapped.lat) || !Number.isFinite(wrapped.lng)) return
        selectRef.current?.({ lat: roundCoordinate(wrapped.lat), long: roundCoordinate(wrapped.lng) })
      })
    }
    markerRef.current = marker
  }, [point, readOnly, attempt])

  return (
    <div className={styles.picker} data-readonly={readOnly ? '' : undefined}>
      <div ref={canvasRef} className={styles.canvas} role="application" aria-label={label} />
      {!readOnly && !failed && <p className={styles.hint}>Toca el mapa o arrastra el marcador para fijar las coordenadas</p>}
      {failed && (
        <div className={styles.failure} role="alert">
          <p>{MAP_ERROR}</p>
          <Button variant="soft" square onClick={() => setAttempt((n) => n + 1)}>Reintentar</Button>
        </div>
      )}
    </div>
  )
}
