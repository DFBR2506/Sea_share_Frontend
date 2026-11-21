import assert from 'node:assert/strict'
import test from 'node:test'
import { canRegisterClaim, evidenceLinks, isEvidenceUrl } from '../src/features/reservations/disputes.js'
import { reservationView } from '../src/features/reservations/reservationViews.js'

test('solo permite el reclamo en la ventana abierta, sin reclamo previo y en PENDING', () => {
  const dispute = { status: 'PENDING', windowStart: '2026-11-21T13:00:00Z', windowEnd: '2026-11-22T13:00:00Z' }
  assert.equal(canRegisterClaim(dispute, Date.parse(dispute.windowStart)), true)
  assert.equal(canRegisterClaim(dispute, Date.parse(dispute.windowEnd)), false)
  assert.equal(canRegisterClaim({ ...dispute, claimData: {} }, Date.parse(dispute.windowStart)), false)
  assert.equal(canRegisterClaim({ ...dispute, status: 'REJECTED' }, Date.parse(dispute.windowStart)), false)
})
test('normaliza enlaces sin permitir protocolos ejecutables', () => {
  assert.deepEqual(evidenceLinks('https://example.test/a\n\n https://example.test/a '), ['https://example.test/a'])
  assert.equal(isEvidenceUrl('https://example.test/photo'), true)
  for (const value of ['javascript:alert(1)', 'data:text/html,test', 'invalid']) assert.equal(isEvidenceUrl(value), false)
})
test('el historial no mezcla borradores ni canceladas, expiradas o pagos fallidos', () => {
  const rows = ['INICIADA', 'PENDIENTE_PAGO', 'CONFIRMADA', 'COMPLETADA', 'CANCELADA', 'EXPIRADA', 'PAGO_FALLIDO'].map((status) => ({ status }))
  assert.deepEqual(reservationView(rows, 'historial').map((r) => r.status), ['PENDIENTE_PAGO', 'CONFIRMADA', 'COMPLETADA'])
  assert.deepEqual(reservationView(rows, 'canceladas').map((r) => r.status), ['CANCELADA', 'EXPIRADA', 'PAGO_FALLIDO'])
})
