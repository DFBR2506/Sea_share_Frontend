import { photoError } from './validation'

// Deja margen para el formulario multipart al atravesar un reverse proxy.
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024

async function decodePhoto(file) {
  if (typeof createImageBitmap === 'function') return createImageBitmap(file)
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    return image
  } finally {
    URL.revokeObjectURL(url)
  }
}

function canvasBlob(canvas, type) {
  return new Promise((resolve, reject) => canvas.toBlob(
    (blob) => blob ? resolve(blob) : reject(new Error('No se pudo preparar la fotografía. Selecciona otra imagen.')),
    type, 0.85,
  ))
}

export async function preparePhoto(file) {
  const error = await photoError(file)
  if (error) throw new Error(error)
  if (!file) return null
  const header = new Uint8Array(await file.slice(0, 8).arrayBuffer())
  const type = header[0] === 0x89 ? 'image/png' : 'image/jpeg'
  const extension = type === 'image/png' ? 'png' : 'jpg'
  const name = `${(file.name || 'embarcacion').replace(/\.[^.]+$/, '')}.${extension}`
  let image
  try {
    image = await decodePhoto(file)
  } catch {
    throw new Error('No se pudo abrir la imagen. Puede estar dañada o tener una extensión incorrecta. Guárdala nuevamente como PNG o JPG.')
  }
  try {
    // Corrige MIME y extensión sin cambiar los bytes de las imágenes pequeñas.
    if (file.size <= MAX_UPLOAD_BYTES) return new File([file], name, { type, lastModified: file.lastModified })
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    if (!context) throw new Error('No se pudo procesar la imagen en este navegador.')
    let scale = Math.min(1, 2048 / Math.max(image.width, image.height))
    for (let attempt = 0; attempt < 6; attempt += 1) {
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const blob = await canvasBlob(canvas, type)
      if (blob.size <= MAX_UPLOAD_BYTES) return new File([blob], name, { type })
      scale *= 0.75
    }
    throw new Error('No se pudo reducir la imagen para enviarla. Selecciona una fotografía más pequeña.')
  } finally {
    image.close?.()
  }
}

export function photoSaveMessage(error) {
  if (error?.status === 413) return 'El servidor rechazó el tamaño del archivo. Selecciona una fotografía más pequeña e inténtalo de nuevo.'
  if (error?.status === 502) return 'El servidor no pudo guardar la fotografía en el almacenamiento de imágenes. No es un rechazo de formato. Conserva tus datos y reintenta; si persiste, hay que revisar el servicio de imágenes de M1.'
  return error?.message
}
