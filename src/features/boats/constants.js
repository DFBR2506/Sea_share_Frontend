// Vocabulario de la UI de embarcaciones (M1).
export const MANDATORY_SERVICES = ['Capitán', 'Combustible']

// Servicios adicionales: clave del contrato de M1 (snake_case) y etiqueta en pantalla.
export const SERVICES = [
  { key: 'life_jackets', label: 'Chalecos salvavidas' },
  { key: 'cooler_with_ice', label: 'Nevera con hielo' },
  { key: 'sound_system', label: 'Equipo de sonido' },
  { key: 'fishing_gear', label: 'Equipo de pesca' },
  { key: 'diving_gear', label: 'Equipo de buceo' },
]
export const SERVICE_OPTIONS = SERVICES.map((s) => s.label)

// Estados operativos de M1 (`status`) → estado de la UI.
export const STATUS_UI = {
  DISPONIBLE: { label: 'Disponible', tone: 'ok' },
  RESERVADO: { label: 'Reservada', tone: 'warn' },
  EN_NAVEGACION: { label: 'En Navegación', tone: 'warn' },
  MANTENIMIENTO: { label: 'En Mantenimiento', tone: 'warn' },
}

export const STATUS_OPTIONS = [
  { value: 'DISPONIBLE', label: 'Disponible' },
  { value: 'MANTENIMIENTO', label: 'En Mantenimiento' },
]
