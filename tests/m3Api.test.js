import assert from 'node:assert/strict'
import test, { beforeEach } from 'node:test'

// Configuración que Vite tomaría del .env; el loader de tests la expone como import.meta.env.
const OWNER_ID = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'
globalThis.__VITE_ENV__ = { VITE_API_M3_URL: 'http://m3.test', VITE_M3_OWNER_ID: OWNER_ID }

const api = await import('../src/features/finance/api/index.js')
const { ApiError, NetworkError } = await import('../src/lib/http.js')
const { M3_ERROR_MESSAGES, m3ErrorMessage } = await import('../src/features/finance/errors.js')

const BOAT = '3f2c1a54-8b3e-4d7a-9c10-5a2b7e6f1d01'
const RESERVATION = 'b7d0e2a1-6c44-4f1b-8a9d-3e5f7a1c9b10'

const json = (status, body, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': status >= 400 ? 'application/problem+json' : 'application/json', ...headers },
})
const problem = (status, code, extra = {}) => json(status, {
  type: 'about:blank', title: 'Problem', status, detail: 'Technical detail in English', code, retryable: false, ...extra,
})

let calls
let respond
beforeEach(() => {
  calls = []
  respond = () => json(200, {})
})
globalThis.fetch = async (input, options = {}) => {
  const url = new URL(String(input))
  calls.push({ url, method: options.method ?? 'GET', headers: options.headers, body: options.body ? JSON.parse(options.body) : undefined })
  return respond(url, options)
}

const batchResponse = (ids) => ({
  evaluation_date: '2026-11-13', duration_days: 1, passengers: 1,
  estimates: ids.filter((id) => id !== 'sin-tarifa').map((id) => ({ boat_id: id, estimated_total: '365000.00' })),
  unavailable: ids.filter((id) => id === 'sin-tarifa').map((id) => ({ boat_id: id, reason: 'NO_BASE_RATE' })),
})

test('UC01 lote: envía boat_ids y traduce estimaciones y no disponibles', async () => {
  respond = (_url, options) => json(200, batchResponse(JSON.parse(options.body).boat_ids))
  const result = await api.estimateBatch([BOAT, 'sin-tarifa'])

  assert.equal(calls.length, 1)
  assert.equal(calls[0].url.href, 'http://m3.test/api/v1/estimates/batch')
  assert.equal(calls[0].method, 'POST')
  assert.deepEqual(calls[0].body, { boat_ids: [BOAT, 'sin-tarifa'] })
  assert.deepEqual(result, {
    evaluationDate: '2026-11-13', durationDays: 1, passengers: 1,
    amounts: { [BOAT]: '365000.00' },
    unavailable: [{ boat_id: 'sin-tarifa', reason: 'NO_BASE_RATE' }],
  })
})

test('UC01 lote: más de 50 ids se parten en bloques, sin duplicados, y se combinan', async () => {
  respond = (_url, options) => json(200, batchResponse(JSON.parse(options.body).boat_ids))
  const ids = Array.from({ length: 120 }, (_, i) => `boat-${i}`)
  const result = await api.estimateBatch([...ids, ...ids.slice(0, 10)])

  assert.deepEqual(calls.map((c) => c.body.boat_ids.length), [50, 50, 20])
  assert.ok(calls.every((c) => c.body.boat_ids.length <= api.MAX_BATCH_SIZE))
  assert.equal(Object.keys(result.amounts).length, 120)
})

test('UC01 lote: si un bloque falla no se devuelven precios parciales', async () => {
  respond = (_url, options) => {
    const ids = JSON.parse(options.body).boat_ids
    return ids.includes('boat-60') ? problem(503, 'FLEET_UNAVAILABLE', { retryable: true }) : json(200, batchResponse(ids))
  }
  await assert.rejects(api.estimateBatch(Array.from({ length: 70 }, (_, i) => `boat-${i}`)), (error) => {
    assert.ok(error instanceof ApiError)
    assert.equal(error.code, 'FLEET_UNAVAILABLE')
    assert.equal(error.retryable, true)
    return true
  })
})

test('UC02 individual: cuerpo snake_case y montos como string decimal', async () => {
  respond = () => json(200, {
    boat_id: BOAT, start_date: '2026-12-20', end_date: '2026-12-22', duration_days: 3, passengers: 4,
    estimated_total: '1372500.00', warning: 'Valor estimado.',
  })
  const result = await api.estimateIndividual({ boatId: BOAT, startDate: '2026-12-20', endDate: '2026-12-22', passengers: 4 })

  assert.deepEqual(calls[0].body, { boat_id: BOAT, start_date: '2026-12-20', end_date: '2026-12-22', passengers: 4 })
  assert.deepEqual(result, { durationDays: 3, passengers: 4, total: '1372500.00', warning: 'Valor estimado.' })
})

test('UC04 y UC06: rutas por reserva y montos nulos conservados', async () => {
  respond = (url) => url.pathname.endsWith('/calculated-value')
    ? json(200, { reservation_id: RESERVATION, rental_amount: '900000.00', insurance_amount: '60000.00', guarantee_deposit_amount: '30000.00', total_amount: '990000.00' })
    : json(200, { reservation_id: RESERVATION, status: 'APPROVED', detail: null, authorized_amount: null, captured_amount: null, released_amount: null, charged_amount: '990000.00', external_reference: 'pg-8841' })

  const value = await api.getReservationValue(RESERVATION)
  const confirmation = await api.getPaymentConfirmation(RESERVATION)

  assert.equal(calls[0].method, 'POST')
  assert.equal(calls[0].url.pathname, `/api/v1/reservations/${RESERVATION}/calculated-value`)
  assert.equal(calls[1].url.pathname, `/api/v1/reservations/${RESERVATION}/payment-confirmation`)
  assert.deepEqual(value, { rental: '900000.00', insurance: '60000.00', deposit: '30000.00', total: '990000.00' })
  assert.deepEqual(confirmation, {
    status: 'APPROVED', detail: null, authorized: null, captured: null, released: null, charged: '990000.00', externalRef: 'pg-8841',
  })
})

test('UC12 propietario: owner_id de la configuración y todos los filtros en la query', async () => {
  respond = () => json(200, {
    content: [{ record_type: 'CHARGE', reservation_id: RESERVATION, owner_id: OWNER_ID, boat_id: BOAT, amount: '990000.00', created_at: '2026-11-13T15:04:05Z', external_reference: null }],
    page_number: 2, page_size: 5, total_elements: 6, total_pages: 2,
  })
  const result = await api.listRecords({
    scope: 'owner', type: 'CHARGE', boatId: BOAT, reservationId: RESERVATION,
    dateFrom: '2026-11-01', dateTo: '2026-11-30', page: 2, pageSize: 5,
  })

  assert.deepEqual(Object.fromEntries(calls[0].url.searchParams), {
    scope: 'OWNER', owner_id: OWNER_ID, page: '2', size: '5', transaction_type: 'CHARGE',
    boat_id: BOAT, reservation_id: RESERVATION, date_from: '2026-11-01', date_to: '2026-11-30',
  })
  assert.equal(result.items[0].amount, '990000.00')
  assert.equal(result.items[0].externalRef, '—')
  assert.equal(typeof result.items[0].createdAt, 'string')
  assert.deepEqual({ total: result.total, totalPages: result.totalPages, page: result.page, pageSize: result.pageSize }, { total: 6, totalPages: 2, page: 2, pageSize: 5 })
})

test('UC12 plataforma: sin owner_id ni filtros vacíos', async () => {
  respond = () => json(200, { content: [], page_number: 1, page_size: 10, total_elements: 0, total_pages: 0 })
  await api.listRecords({ scope: 'admin', ownerId: '  ', type: '', page: 1, pageSize: 10 })
  assert.deepEqual(Object.fromEntries(calls[0].url.searchParams), { scope: 'PLATFORM', page: '1', size: '10' })
})

test('UC13 informe: traduce campos y conserva la variación no calculable', async () => {
  respond = () => json(200, {
    periodicity: 'MONTHLY', period: '2026-10', is_closed: true, scope: 'PLATFORM',
    net_amount: '0.00', total_collections: '0.00', total_refunds: '0.00', total_settlements: '0.00', total_commissions: '0.00',
    counts: { CHARGE: 0, REFUND: 0, SETTLEMENT: 0, COMMISSION: 0 },
    comparison: { previous_period: '2026-09', absolute_variation: '0.00', percentage_variation: null },
  })
  const report = await api.getReport({ scope: 'admin', periodicity: 'MONTHLY', period: '' })

  assert.deepEqual(Object.fromEntries(calls[0].url.searchParams), { scope: 'PLATFORM', periodicity: 'MONTHLY' })
  assert.equal(report.closed, true)
  assert.equal(report.net, '0.00')
  assert.deepEqual(report.comparison, { previousPeriod: '2026-09', absolute: '0.00', percentage: null })
})

test('UC13 export: pide CSV aceptando Problem Details y lee el nombre del archivo', async () => {
  const backendCsv = 'Alcance,Periodo,Total Cobros\r\nOWNER,2026-10,585000.00\r\n'
  respond = () => new Response(backendCsv, {
    status: 200, headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="informe_financiero_2026-10.csv"' },
  })
  const { blob, filename } = await api.exportReport({ scope: 'owner', periodicity: 'MONTHLY', period: '2026-10' })

  assert.equal(calls[0].headers.Accept, 'text/csv, application/problem+json')
  assert.equal(calls[0].url.searchParams.get('owner_id'), OWNER_ID)
  assert.equal(filename, 'informe_financiero_2026-10.csv')
  // El archivo que se guarda es la versión vertical legible (ver tests/reportCsv.test.js).
  assert.equal(await blob.text(), 'sep=,\r\nConcepto,Valor\r\nAlcance,Propietario\r\nPeriodo,2026-10\r\nTotal cobros,585000.00\r\n')
  assert.match(blob.type, /^text\/csv/)
})

test('UC11: sin configuración devuelve null y los errores de campo llegan en ApiError', async () => {
  respond = () => problem(404, 'PARAMETERS_NOT_CONFIGURED', { retryable: true })
  assert.equal(await api.getParams(), null)

  respond = () => problem(400, 'VALIDATION_ERROR', { errors: [{ field: 'platform_commission_percentage', message: 'must be between 0 and 100' }] })
  await assert.rejects(api.saveParams({ commission: '150', insurance: '15000', weekend: '10', highSeason: '25' }), (error) => {
    assert.ok(error instanceof ApiError)
    assert.equal(error.fieldError('platform_commission_percentage'), 'must be between 0 and 100')
    return true
  })
  assert.deepEqual(calls[1].body, {
    platform_commission_percentage: '150', insurance_fee_per_passenger: '15000',
    weekend_increase_percentage: '10', high_season_increase_percentage: '25',
  })
})

test('red: un fallo de conexión es NetworkError y la cancelación no se disfraza', async () => {
  respond = () => { throw new TypeError('fetch failed') }
  await assert.rejects(api.getParams(), (error) => error instanceof NetworkError && error.retryable === true)

  respond = () => { throw new DOMException('aborted', 'AbortError') }
  await assert.rejects(api.getPaymentConfirmation(RESERVATION), (error) => error.name === 'AbortError' && !(error instanceof NetworkError))
})

test('mensajes: códigos conocidos en español, 5xx desconocido genérico, sin detalle técnico', () => {
  assert.equal(m3ErrorMessage(new ApiError(503, { code: 'FLEET_UNAVAILABLE', detail: 'Fleet down' })), M3_ERROR_MESSAGES.FLEET_UNAVAILABLE)
  assert.equal(m3ErrorMessage(new ApiError(400, { code: 'INVALID_DATE_RANGE', detail: 'start_date must not be in the past.' })), M3_ERROR_MESSAGES.INVALID_DATE_RANGE)
  assert.equal(m3ErrorMessage(new ApiError(502, { code: 'SOMETHING_NEW', detail: 'stack trace' })), M3_ERROR_MESSAGES.INTERNAL_ERROR)
  assert.equal(m3ErrorMessage(new ApiError(409, { code: 'SOMETHING_NEW', detail: 'Conflicto' })), 'Conflicto')
  assert.equal(m3ErrorMessage(new NetworkError(new TypeError('x'))), new NetworkError().message)
  assert.equal(m3ErrorMessage(new Error('Falta configuración')), 'Falta configuración')
})
