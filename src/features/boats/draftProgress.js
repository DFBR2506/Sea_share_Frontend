// Avance del paso 2 del registro (puerto, coordenadas, tarifa y servicios) para devolvérselo igual
// al propietario si sale y retoma el borrador. Se guarda en el navegador, por usuario y borrador.
// La fotografía no se guarda: hay que volver a elegirla.
const PREFIX = 'seashare.draftProgress'

function storage() {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

const keyOf = (userId, boatId) => `${PREFIX}.${userId}.${boatId}`
const isPoint = (p) => Number.isFinite(p?.lat) && Number.isFinite(p?.long)

/** Guarda el avance; si está todo vacío borra el anterior en lugar de guardar un registro vacío. */
export function saveProgress(userId, boatId, progress) {
  if (!userId || !boatId) return
  const empty = !progress.portName && !progress.hourlyRate && !isPoint(progress.point) && !progress.extras?.length
  try {
    if (empty) storage()?.removeItem(keyOf(userId, boatId))
    else storage()?.setItem(keyOf(userId, boatId), JSON.stringify(progress))
  } catch {
    // Sin almacenamiento el registro sigue funcionando: solo no se conserva el avance.
  }
}

/** Devuelve el avance guardado o null (también si está dañado o no tiene la forma esperada). */
export function loadProgress(userId, boatId) {
  if (!userId || !boatId) return null
  try {
    const raw = storage()?.getItem(keyOf(userId, boatId))
    const data = raw ? JSON.parse(raw) : null
    if (!data || typeof data !== 'object') return null
    return {
      portName: typeof data.portName === 'string' ? data.portName : '',
      hourlyRate: typeof data.hourlyRate === 'string' ? data.hourlyRate : '',
      point: isPoint(data.point) ? { lat: data.point.lat, long: data.point.long } : null,
      extras: Array.isArray(data.extras) ? data.extras.filter((s) => typeof s === 'string') : [],
    }
  } catch {
    return null
  }
}

export function clearProgress(userId, boatId) {
  if (!userId || !boatId) return
  try {
    storage()?.removeItem(keyOf(userId, boatId))
  } catch {
    // Nada que borrar.
  }
}

/** Id del usuario con sesión abierta (lo guarda SessionProvider al entrar). */
export function currentUserId() {
  try {
    return globalThis.localStorage?.getItem('seashare.userId') ?? null
  } catch {
    return null
  }
}
