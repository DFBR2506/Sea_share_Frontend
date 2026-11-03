// Datos de ejemplo (M3 · Finanzas).
export const TYPE_LABEL = { COBRO: 'Cobro', REEMBOLSO: 'Reembolso', DISPERSION: 'Dispersión', COMISION: 'Comisión' }
export const OWNER_ID = 'owner-0284'

const SEQUENCE = [
  ['COBRO', 420000, 'Oceanis 38', 'pay'], ['DISPERSION', 280000, 'Lagoon 42', 'set'], ['COMISION', 33600, 'Lagoon 42', 'set'],
  ['REEMBOLSO', 120000, 'Sea Ray 290', 'ref'], ['COBRO', 560000, 'Bavaria 41', 'pay'],
]

// 24 registros: los 3 de cada 8 pertenecen a otro propietario para probar el filtro del admin
export const RECORDS = Array.from({ length: 24 }, (_, i) => {
  const [type, amount, boat, prefix] = SEQUENCE[i % SEQUENCE.length]
  const day = 26 - Math.floor(i / 2)
  const hh = String(22 - ((i * 3) % 14)).padStart(2, '0')
  const mm = String((i * 17) % 60).padStart(2, '0')
  return {
    id: `r${i + 1}`,
    type,
    reservation: `RSV-${1048 - i * 3}`,
    ownerId: i % 8 === 7 ? 'owner-0310' : OWNER_ID,
    boat,
    amount: amount + (i > 4 ? (i % 7) * 10000 : 0),
    createdAt: `${day} sep · ${hh}:${mm}`,
    externalRef: `${prefix}_${8392 - i * 211}`,
  }
})

export const OWNERS = [{ value: OWNER_ID, label: OWNER_ID }, { value: 'owner-0310', label: 'owner-0310' }]

// Informe: valores base por periodicidad (millones COP)
export const REPORTS = {
  QUINCENAL: { cobros: 9.1, reembolsos: 0.94, dispersiones: 5.7, comisiones: 0.71, deltas: ['+6.2%', '−2.1%', '+4.8%'], counts: [21, 4, 18, 21], ownerGain: [0.52, '+4.6%'], net: [0.3, '+8.9%'], closing: 'corte al 15 sep 2026' },
  MENSUAL: { cobros: 18.42, reembolsos: 2.16, dispersiones: 11.78, comisiones: 1.42, deltas: ['+12.4%', '−4.8%', '+9.1%'], counts: [42, 8, 37, 42], ownerGain: [1.04, '+9.1%'], net: [0.62, '+16.1%'], closing: 'corte al 30 sep 2026' },
  TRIMESTRAL: { cobros: 52.8, reembolsos: 6.4, dispersiones: 33.9, comisiones: 4.1, deltas: ['+18.0%', '−1.2%', '+14.3%'], counts: [118, 21, 104, 118], ownerGain: [3.1, '+12.7%'], net: [1.9, '+21.4%'], closing: 'corte al 30 sep 2026' },
}
export const PERIODS = { QUINCENAL: ['1ª quincena sep 2026', '2ª quincena ago 2026'], MENSUAL: ['Septiembre 2026', 'Agosto 2026', 'Julio 2026'], TRIMESTRAL: ['3T 2026', '2T 2026'] }

export const INITIAL_PARAMS = { version: 12, commission: 12, insurance: 18000, weekend: 8, highSeason: 15, updated: 'hoy' }
export const DEPOSIT_NOTE = '$ 120,000 COP · 10% tarifa base diaria'
export const HIGH_SEASON_WINDOWS = 'Fin de año · mitad de año · Semana Santa · receso'

export const INITIAL_ACCOUNTS = [
  { value: '2840', label: 'Cuenta principal · **** 2840' },
  { value: '7712', label: 'Cuenta de ahorros · **** 7712' },
]
export const INITIAL_BALANCE = 2400000
