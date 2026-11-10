import { INITIAL_ACCOUNTS, INITIAL_BALANCE, INITIAL_PARAMS, OWNER_ID, PERIODS, RECORDS, REPORTS } from './mocks'

// Capa de acceso del módulo 3 (mocks + store en memoria). Se sustituye por `request('m3', ...)`.
const delay = (v, ms = 200) => new Promise((r) => setTimeout(() => r(structuredClone(v)), ms))

let params = { ...INITIAL_PARAMS }
let balance = INITIAL_BALANCE
let withdrawals = []

/** scope 'owner' fuerza el propietario actual; 'admin' acepta un filtro opcional. */
export const listRecords = ({ scope, ownerId, type, page, pageSize }) => {
  const rows = RECORDS.filter((r) => (scope === 'owner' ? r.ownerId === OWNER_ID : !ownerId || r.ownerId === ownerId)).filter((r) => !type || r.type === type)
  const start = (page - 1) * pageSize
  return delay({ items: rows.slice(start, start + pageSize), total: rows.length, page, pageSize })
}

export const getReport = ({ periodicity, period }) => delay({ ...REPORTS[periodicity], periodicity, period: period ?? PERIODS[periodicity][0] })
export const listPeriods = (periodicity) => PERIODS[periodicity]

export const getParams = () => delay(params)
export const saveParams = (next) => {
  params = { ...params, ...next, version: params.version + 1, updated: 'hoy' }
  return delay(params)
}

export const getAccounts = () => delay({ accounts: INITIAL_ACCOUNTS, balance, withdrawals })
export const withdraw = ({ account, amount }) => {
  if (amount > balance) return Promise.reject(new Error('El monto supera tu saldo disponible'))
  balance -= amount
  withdrawals = [{ id: `w${Date.now()}`, account: INITIAL_ACCOUNTS.find((a) => a.value === account)?.label, amount, at: 'hoy' }, ...withdrawals]
  return delay({ balance })
}
