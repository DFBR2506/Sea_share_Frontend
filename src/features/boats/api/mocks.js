// Datos de ejemplo (M1 · Embarcaciones).
export const OWNERS = [
  { id: 'o1', name: 'Fernando Fernandez', initials: 'FF', email: 'fernando.fernandez@seashare.com', phone: '+57 310 456 7890', document: 'Cédula de Ciudadanía: 1042389104', registeredAt: '14 de Enero de 2026', status: 'Cuenta Activa', restrictions: 'Verificado y habilitado para operar flotas en muelles principales' },
  { id: 'o2', name: 'Mariana Gómez', initials: 'MG', email: 'mariana.gomez@seashare.com', phone: '+57 315 220 1188', document: 'Cédula de Ciudadanía: 52871455', registeredAt: '3 de Marzo de 2026', status: 'Cuenta Activa', restrictions: 'Verificado y habilitado para operar flotas en muelles principales' },
]

export const SERVICE_OPTIONS = ['Chalecos salvavidas', 'Nevera con hielo', 'Equipo de sonido', 'Equipo de pesca', 'Equipo de buceo']
export const MANDATORY_SERVICES = ['Capitán', 'Combustible']
export const BOAT_TYPES = ['Lancha', 'Yate', 'Catamarán', 'Velero']

const PORT = { name: 'Marina Fluvial Magdalena (Muelle Principal)', lat: '10.7452° N', long: '74.7891° O' }

export const VESSELS = [
  { id: 'v1', ownerId: 'o1', name: 'Río Magdalena I', isNew: true, plate: 'CP-05-1042-A', type: 'Lancha', capacity: 12, hourlyRate: 180000, status: 'DISPONIBLE', port: PORT, extras: ['Chalecos salvavidas', 'Nevera con hielo', 'Equipo de sonido'] },
  { id: 'v2', ownerId: 'o1', name: 'Atlántico Star', plate: 'CP-12-0891-B', type: 'Yate', capacity: 8, hourlyRate: 420000, status: 'MANTENIMIENTO', port: PORT, extras: ['Nevera con hielo'] },
  { id: 'v3', ownerId: 'o1', name: 'Brisa del Norte', plate: 'CP-01-0332-C', type: 'Catamarán', capacity: 10, hourlyRate: 310000, status: 'DISPONIBLE', port: PORT, extras: ['Chalecos salvavidas'] },
  { id: 'v4', ownerId: 'o2', name: 'Caimán Express', plate: 'CP-08-2210-C', type: 'Lancha', capacity: 6, hourlyRate: 150000, status: 'DISPONIBLE', port: PORT, extras: ['Chalecos salvavidas', 'Equipo de pesca'] },
]

export const STATUS_UI = {
  DISPONIBLE: { label: 'Disponible', tone: 'ok' },
  MANTENIMIENTO: { label: 'En Mantenimiento', tone: 'warn' },
}

// Propietario autenticado en el prototipo (sin auth real todavía)
export const CURRENT_OWNER_ID = 'o1'
