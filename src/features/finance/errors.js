import { ApiError, NetworkError } from '@/lib/http'

// Mensajes en español para los `code` del catálogo de errores de M3 (contracts/README §3.4).
// El `detail` del servidor viene en inglés y es técnico: la UI muestra estos textos.
export const M3_ERROR_MESSAGES = {
  VALIDATION_ERROR: 'La solicitud tiene datos inválidos. Revisa los campos e intenta de nuevo.',
  BATCH_SIZE_EXCEEDED: 'Se pidieron demasiadas embarcaciones a la vez para estimar su precio.',
  INVALID_DATE_RANGE: 'El rango de fechas no es válido: no se admiten fechas pasadas y la fecha final no puede ser anterior a la inicial.',
  INVALID_PERIOD: 'El período seleccionado no es válido.',
  RESERVATION_INFO_NOT_FOUND: 'Finanzas aún no tiene registrada la información de esta reserva. Vuelve a consultar en unos segundos.',
  CHARGE_INTENT_NOT_FOUND: 'Todavía no hay un cobro iniciado para esta reserva. Vuelve a consultar más tarde.',
  PARAMETERS_NOT_CONFIGURED: 'Aún no hay parámetros financieros configurados.',
  PAGE_OUT_OF_RANGE: 'La página solicitada quedó fuera de rango: vuelve a una página anterior o afina los filtros.',
  METHOD_NOT_ALLOWED: 'La operación no está disponible en el servicio de finanzas.',
  NOT_ACCEPTABLE: 'El servicio de finanzas no puede entregar el formato solicitado.',
  UNSUPPORTED_MEDIA_TYPE: 'El servicio de finanzas no acepta el formato enviado.',
  BASE_RATE_NOT_AVAILABLE: 'Esta embarcación no tiene una tarifa base disponible en este momento.',
  RESERVATION_INFO_INCOMPLETE: 'La información registrada de la reserva está incompleta y no permite calcular su valor.',
  PARAMETERS_SAVE_FAILED: 'No se pudieron guardar los parámetros; la configuración anterior se conserva. Intenta de nuevo.',
  INTERNAL_ERROR: 'Ocurrió un error inesperado en el servicio de finanzas. Intenta de nuevo.',
  FLEET_UNAVAILABLE: 'El sistema de flota no responde y no se pueden calcular precios. Intenta de nuevo en unos minutos.',
  FINANCIAL_PARAMETERS_NOT_CONFIGURED: 'Faltan parámetros financieros (seguro o recargos) para calcular el precio. El administrador financiero debe configurarlos.',
}

/** Texto para mostrar al usuario a partir de cualquier error de una llamada a M3. */
export function m3ErrorMessage(error) {
  if (error instanceof ApiError) {
    if (M3_ERROR_MESSAGES[error.code]) return M3_ERROR_MESSAGES[error.code]
    // Código desconocido: sin detalle técnico del servidor en 5xx.
    return error.status >= 500 ? M3_ERROR_MESSAGES.INTERNAL_ERROR : error.message
  }
  if (error instanceof NetworkError) return error.message
  return error?.message ?? M3_ERROR_MESSAGES.INTERNAL_ERROR
}
