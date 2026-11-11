// Datos de ejemplo (M3 · Finanzas).
export const TYPE_LABEL = { CHARGE: 'Cobro', REFUND: 'Reembolso', SETTLEMENT: 'Dispersión', COMMISSION: 'Comisión' }
// Hasta que exista autenticación, el propietario del alcance OWNER se toma de la configuración (UUID).
export const OWNER_ID = import.meta.env.VITE_M3_OWNER_ID ?? 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'

export const INITIAL_ACCOUNTS = [
  { value: '2840', label: 'Cuenta principal · **** 2840' },
  { value: '7712', label: 'Cuenta de ahorros · **** 7712' },
]
export const INITIAL_BALANCE = 2400000
