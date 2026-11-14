import { request, requestFile, ApiError } from '@/lib/http'
import { formatDateTime } from '@/lib/dates'
import { requireOwnerId } from './config'

// Capa de acceso a datos de M3 (finanzas): estimaciones (UC01/UC02), parámetros (UC11),
// registros (UC12), informe y export CSV (UC13), cálculo y confirmación de reserva (UC04/UC06).
// Convención de la integración: el snake_case del contrato se traduce aquí y el dinero viaja
// como string decimal (2 cifras) hasta la pantalla, que lo formatea (`copDecimal`). Los mocks
// en memoria se retiraron: un fallo de M3 nunca se enmascara con datos simulados.

// Tipos de registro del contrato (UC12/UC13); también alimenta el filtro por tipo.
export const TYPE_LABEL = { CHARGE: 'Cobro', REFUND: 'Reembolso', SETTLEMENT: 'Dispersión', COMMISSION: 'Comisión' }

// Alcance OWNER declarado por configuración (ver api/config.js).
export { OWNER_ID } from './config'

// scope 'owner' → OWNER con el owner_id de la configuración (obligatorio y validado);
// 'admin' → PLATFORM con owner_id opcional (filtro de propietario ya validado por la pantalla).
function scopeQuery(scope, ownerId) {
  const query = new URLSearchParams({ scope: scope === 'owner' ? 'OWNER' : 'PLATFORM' })
  const owner = scope === 'owner' ? requireOwnerId() : ownerId?.trim()
  if (owner) query.set('owner_id', owner)
  return query
}

// Máximo de boat_ids por petición (`seashare.estimates.max-batch-size`); más → 400 BATCH_SIZE_EXCEEDED.
export const MAX_BATCH_SIZE = 50

// UC01 · POST /api/v1/estimates/batch. La estimación del lote es la de HOY con 1 día y 1
// pasajero (incluye el seguro): NO es la tarifa diaria de la embarcación. Las listas de más de
// MAX_BATCH_SIZE se parten en varias peticiones en paralelo y se combinan; si una falla, falla todo
// (nunca se muestran precios parciales de un lote incompleto).
export const estimateBatch = async (boatIds) => {
  const unique = [...new Set(boatIds)]
  const chunks = []
  for (let i = 0; i < unique.length; i += MAX_BATCH_SIZE) chunks.push(unique.slice(i, i + MAX_BATCH_SIZE))
  if (chunks.length === 0) chunks.push([])
  const responses = await Promise.all(chunks.map((ids) =>
    request('m3', '/api/v1/estimates/batch', { method: 'POST', body: { boat_ids: ids } })))
  const [first] = responses
  return {
    evaluationDate: first.evaluation_date,
    durationDays: first.duration_days,
    passengers: first.passengers,
    // Mapa boat_id → estimated_total; lo que Flota no cotiza llega en `unavailable`.
    amounts: Object.fromEntries(responses.flatMap((res) => res.estimates.map((e) => [e.boat_id, e.estimated_total]))),
    unavailable: responses.flatMap((res) => res.unavailable),
  }
}

// UC02 · POST /api/v1/estimates/individual con las fechas y pasajeros de la selección.
// `warning` acompaña siempre (estimación no contractual); fechas pasadas → 400 INVALID_DATE_RANGE.
export const estimateIndividual = async ({ boatId, startDate, endDate, passengers }, signal) => {
  const r = await request('m3', '/api/v1/estimates/individual', {
    method: 'POST',
    body: { boat_id: boatId, start_date: startDate, end_date: endDate, passengers },
    signal,
  })
  return { durationDays: r.duration_days, passengers: r.passengers, total: r.estimated_total, warning: r.warning }
}

// UC04 · POST /api/v1/reservations/{id}/calculated-value (sin cuerpo). Además de devolver el
// desglose, registra los montos que usará el cobro (PENDING): no recalcular sin necesidad.
export const getReservationValue = async (reservationId) => {
  const r = await request('m3', `/api/v1/reservations/${reservationId}/calculated-value`, { method: 'POST' })
  return { rental: r.rental_amount, insurance: r.insurance_amount, deposit: r.guarantee_deposit_amount, total: r.total_amount }
}

// UC06 · GET /api/v1/reservations/{id}/payment-confirmation. `status`: IN_PROCESS | APPROVED |
// REJECTED | CANCELLED | EXPIRED | UNKNOWN. Los montos no disponibles llegan como null.
export const getPaymentConfirmation = async (reservationId, signal) => {
  const r = await request('m3', `/api/v1/reservations/${reservationId}/payment-confirmation`, { signal })
  return {
    status: r.status,
    detail: r.detail,
    authorized: r.authorized_amount,
    captured: r.captured_amount,
    released: r.released_amount,
    charged: r.charged_amount,
    externalRef: r.external_reference,
  }
}

// UC12 · GET /api/v1/financial-records. Paginación 1-indexed; filtros opcionales por
// transacción, propietario, embarcación, reserva y rango de fechas (yyyy-MM-dd).
export const listRecords = async ({ scope, ownerId, type, boatId, reservationId, dateFrom, dateTo, page, pageSize }) => {
  const query = scopeQuery(scope, ownerId)
  query.set('page', page)
  query.set('size', pageSize)
  if (type) query.set('transaction_type', type)
  if (boatId) query.set('boat_id', boatId)
  if (reservationId) query.set('reservation_id', reservationId)
  if (dateFrom) query.set('date_from', dateFrom)
  if (dateTo) query.set('date_to', dateTo)
  const res = await request('m3', `/api/v1/financial-records?${query}`)
  return {
    items: res.content.map((r, i) => ({
      id: `${r.reservation_id}-${r.record_type}-${r.created_at}-${i}`,
      type: r.record_type,
      reservation: r.reservation_id,
      ownerId: r.owner_id,
      boat: r.boat_id,
      amount: r.amount,
      createdAt: formatDateTime(r.created_at),
      externalRef: r.external_reference ?? '—',
    })),
    total: res.total_elements,
    totalPages: res.total_pages,
    page: res.page_number,
    pageSize: res.page_size,
  }
}

// UC13 · GET /api/v1/financial-report. Sin `period` el backend usa el último período cerrado.
// `comparison.percentage_variation` es null cuando el período anterior vale 0 (no calculable).
export const getReport = async ({ scope, periodicity, period }) => {
  const query = scopeQuery(scope)
  query.set('periodicity', periodicity)
  if (period) query.set('period', period)
  const r = await request('m3', `/api/v1/financial-report?${query}`)
  return {
    periodicity: r.periodicity,
    period: r.period,
    closed: r.is_closed,
    net: r.net_amount,
    collections: r.total_collections,
    refunds: r.total_refunds,
    settlements: r.total_settlements,
    commissions: r.total_commissions,
    counts: r.counts,
    comparison: {
      previousPeriod: r.comparison.previous_period,
      absolute: r.comparison.absolute_variation,
      percentage: r.comparison.percentage_variation,
    },
  }
}

// UC13 · GET /api/v1/financial-report/export. A diferencia de la consulta, `period` es obligatorio.
export const exportReport = ({ scope, periodicity, period }) => {
  const query = scopeQuery(scope)
  query.set('periodicity', periodicity)
  query.set('period', period)
  return requestFile('m3', `/api/v1/financial-report/export?${query}`, { accept: 'text/csv, application/problem+json' })
}

// UC11 · GET /api/v1/financial-parameters. Devuelve `null` si aún no hay configuración (404 PARAMETERS_NOT_CONFIGURED).
// Los porcentajes y el seguro se conservan como string de 4 decimales para que reenviarlos no cree una versión nueva.
export const getParams = async () => {
  try {
    const p = await request('m3', '/api/v1/financial-parameters')
    return {
      version: p.version_number,
      commission: p.platform_commission_percentage,
      insurance: p.insurance_fee_per_passenger,
      weekend: p.weekend_increase_percentage,
      highSeason: p.high_season_increase_percentage,
      depositRule: p.guarantee_deposit_rule,
      highSeasonWindows: p.high_season_windows,
    }
  } catch (e) {
    if (e instanceof ApiError && e.isCode('PARAMETERS_NOT_CONFIGURED')) return null
    throw e
  }
}

// UC11 · PUT /api/v1/financial-parameters. Reemplazo total; el mismo contenido no crea versión nueva.
// Errores 400 VALIDATION_ERROR llegan como ApiError con `errors[{ field, message }]`.
export const saveParams = async ({ commission, insurance, weekend, highSeason }) => {
  const res = await request('m3', '/api/v1/financial-parameters', {
    method: 'PUT',
    body: {
      platform_commission_percentage: commission,
      insurance_fee_per_passenger: insurance,
      weekend_increase_percentage: weekend,
      high_season_increase_percentage: highSeason,
    },
  })
  return { version: res.version_number }
}
