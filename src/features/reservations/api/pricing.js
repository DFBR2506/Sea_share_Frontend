// Regla única de precios del MOCK VISUAL de reservas (M2 no está integrado). Todo en COP y
// alineado con el cálculo de M3 (UC04), sin tarifa dinámica:
//   alquiler = tarifa diaria × días inclusivos
//   seguro   = tarifa de seguro × pasajeros
//   depósito = 10 % de la tarifa diaria (no se multiplica por días ni pasajeros)
//   total    = alquiler + seguro + depósito   (lo que paga el arrendatario)
//   comisión = % de plataforma sobre el alquiler (se descuenta al propietario, no al arrendatario)
export const INSURANCE_PER_PASSENGER = 15000
export const DEPOSIT_RATE = 0.1
export const COMMISSION_RATE = 0.15

export function mockBreakdown(dailyRate, days, passengers) {
  const base = dailyRate * days
  const insurance = INSURANCE_PER_PASSENGER * passengers
  const deposit = Math.round(dailyRate * DEPOSIT_RATE)
  const commission = Math.round(base * COMMISSION_RATE)
  return {
    days,
    base,
    insurance,
    insurancePerPassenger: INSURANCE_PER_PASSENGER,
    deposit,
    total: base + insurance + deposit,
    commission,
    ownerNet: base - commission,
  }
}
