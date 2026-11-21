import assert from 'node:assert/strict'
import test from 'node:test'
import { departureError, harborDateTime, minimumDepartureTime } from '../src/features/reservations/checkout/departure.js'

const now = Date.parse('2026-11-21T13:30:15Z')
test('compara la hora del puerto, no la zona del dispositivo', () => {
  assert.deepEqual(harborDateTime(now), { date: '2026-11-21', time: '08:30' })
  for (const time of ['00:00', '08:28', '08:30', '25:00', 'invalid', '']) assert.ok(departureError('2026-11-21', time, undefined, now))
  assert.equal(departureError('2026-11-21', '08:31', undefined, now), '')
  assert.equal(departureError('2026-11-22', '00:00', undefined, now), '')
  assert.ok(departureError('2026-11-20', '23:59', undefined, now))
  assert.equal(minimumDepartureTime('2026-11-21', undefined, now), '08:31')
  assert.equal(minimumDepartureTime('2026-11-22', undefined, now), undefined)
})
test('actualiza el día al cruzar medianoche en Colombia', () => {
  assert.equal(harborDateTime(Date.parse('2026-11-22T04:59:59Z')).date, '2026-11-21')
  assert.deepEqual(harborDateTime(Date.parse('2026-11-22T05:00:00Z')), { date: '2026-11-22', time: '00:00' })
})
