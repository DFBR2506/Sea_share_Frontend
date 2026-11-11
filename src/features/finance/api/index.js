import { request, requestFile, ApiError } from '@/lib/http'
import { INITIAL_ACCOUNTS, INITIAL_BALANCE, OWNER_ID } from './mocks'
import { formatDateTime } from '@/lib/dates'

// Capa de acceso del módulo 3 (mocks + store en memoria). Se sustituye por `request('m3', ...)`.
const delay = (v, ms = 200) => new Promise((r) => setTimeout(() => r(structuredClone(v)), ms))

let balance = INITIAL_BALANCE
let withdrawals = []

// UC12 · GET /api/v1/financial-records. scope 'owner' → OWNER (owner_id obligatorio); 'admin' → PLATFORM (owner_id opcional).
// `type` usa los valores del contrato: CHARGE | REFUND | SETTLEMENT | COMMISSION.
export const listRecords = async ({ scope, ownerId, type, page, pageSize }) => {
  const query = new URLSearchParams({ scope: scope === 'owner' ? 'OWNER' : 'PLATFORM', page, size: pageSize })
  const owner = scope === 'owner' ? OWNER_ID : ownerId?.trim()
  if (owner) query.set('owner_id', owner)
  if (type) query.set('transaction_type', type)
  const res = await request('m3', `/api/v1/financial-records?${query}`)
  return {
    items: res.content.map((r, i) => ({
      id: `${r.reservation_id}-${r.record_type}-${r.created_at}-${i}`,
      type: r.record_type,
      reservation: r.reservation_id,
      ownerId: r.owner_id,
      boat: r.boat_id,
      amount: Number(r.amount),
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
  const query = new URLSearchParams({ scope: scope === 'owner' ? 'OWNER' : 'PLATFORM', periodicity })
  if (scope === 'owner') query.set('owner_id', OWNER_ID)
  if (period) query.set('period', period)
  const r = await request('m3', `/api/v1/financial-report?${query}`)
  return {
    periodicity: r.periodicity,
    period: r.period,
    closed: r.is_closed,
    net: Number(r.net_amount),
    collections: Number(r.total_collections),
    refunds: Number(r.total_refunds),
    settlements: Number(r.total_settlements),
    commissions: Number(r.total_commissions),
    counts: r.counts,
    comparison: {
      previousPeriod: r.comparison.previous_period,
      absolute: Number(r.comparison.absolute_variation),
      percentage: r.comparison.percentage_variation == null ? null : Number(r.comparison.percentage_variation),
    },
  }
}

// UC13 · GET /api/v1/financial-report/export. A diferencia de la consulta, `period` es obligatorio.
export const exportReport = ({ scope, periodicity, period }) => {
  const query = new URLSearchParams({ scope: scope === 'owner' ? 'OWNER' : 'PLATFORM', periodicity, period })
  if (scope === 'owner') query.set('owner_id', OWNER_ID)
  return requestFile('m3', `/api/v1/financial-report/export?${query}`, { accept: 'text/csv' })
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
    if (e instanceof ApiError && e.code === 'PARAMETERS_NOT_CONFIGURED') return null
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

export const getAccounts = () => delay({ accounts: INITIAL_ACCOUNTS, balance, withdrawals })
export const withdraw = ({ account, amount }) => {
  if (amount > balance) return Promise.reject(new Error('El monto supera tu saldo disponible'))
  balance -= amount
  withdrawals = [{ id: `w${Date.now()}`, account: INITIAL_ACCOUNTS.find((a) => a.value === account)?.label, amount, at: 'hoy' }, ...withdrawals]
  return delay({ balance })
}
