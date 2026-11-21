import { useCallback, useEffect, useRef, useState } from 'react'
import { preparePhoto } from './photoUpload'

export function usePhotoUpload() {
  const [photo, setPhoto] = useState(null)
  const [photoProblem, setPhotoProblem] = useState(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoPreview, setPhotoPreview] = useState(null)
  const revision = useRef(0)
  const preview = useRef(null)

  useEffect(() => () => {
    revision.current += 1
    if (preview.current) URL.revokeObjectURL(preview.current)
  }, [])

  const pickPhoto = useCallback(async (file) => {
    const selected = ++revision.current
    if (preview.current) URL.revokeObjectURL(preview.current)
    preview.current = null
    setPhotoPreview(null)
    setPhoto(null)
    setPhotoProblem(null)
    setPhotoBusy(Boolean(file))
    if (!file) return
    try {
      const prepared = await preparePhoto(file)
      if (revision.current === selected) {
        preview.current = URL.createObjectURL(prepared)
        setPhotoPreview(preview.current)
        setPhoto(prepared)
      }
    } catch (error) {
      if (revision.current === selected) setPhotoProblem(error.message || 'No se pudo leer la fotografía. Selecciónala de nuevo.')
    } finally {
      if (revision.current === selected) setPhotoBusy(false)
    }
  }, [])

  return { photo, photoProblem, photoBusy, photoPreview, pickPhoto }
}
