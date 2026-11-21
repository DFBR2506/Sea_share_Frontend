import assert from 'node:assert/strict'
import test from 'node:test'
import { readPaymentSelection } from '../src/features/reservations/checkout/selection.js'

const query = (value) => new URLSearchParams(value)
const valid = 'start=2026-11-20&end=2026-11-22&pax=2'
const clock = { now: Date.parse('2026-11-10T12:00:00Z') }

test('selección válida conserva fechas locales y pasajeros', () => {
  const selection = readPaymentSelection(query(valid), 6, clock)
  assert.equal(selection.start.getFullYear(), 2026)
  assert.equal(selection.start.getMonth(), 10)
  assert.equal(selection.start.getDate(), 20)
  assert.equal(selection.end.getDate(), 22)
  assert.equal(selection.pax, 2)
})

test('rechaza fechas inexistentes, formatos inválidos, rangos invertidos y campos ausentes', () => {
  for (const value of [
    '', 'start=invalid&end=2026-11-22&pax=2',
    'start=2026-02-30&end=2026-03-03&pax=2',
    'start=2026-11-22&end=2026-11-20&pax=2',
    'start=2026-1-20&end=2026-11-22&pax=2',
    'start=2026-11-20&end=2026-11-22',
  ]) assert.equal(readPaymentSelection(query(value), 6, clock), null, value)
})

test('rechaza pasajeros inválidos o superiores a una capacidad conocida', () => {
  for (const pax of ['0', '-1', '1.5', 'Infinity', 'abc', '7']) {
    assert.equal(readPaymentSelection(query(valid.replace('pax=2', `pax=${pax}`)), 6, clock), null)
  }
  for (const capacity of [undefined, null, NaN, 0, -1, '6']) {
    assert.equal(readPaymentSelection(query(valid), capacity, clock), null)
  }
})

test('rechaza un acceso directo con una fecha anterior al día del puerto', () => {
  assert.equal(readPaymentSelection(query(valid), 6, { now: Date.parse('2026-11-21T13:00:00Z') }), null)
  assert.ok(readPaymentSelection(query('start=2026-11-20&end=2026-11-22&pax=2'), 6,
    { now: Date.parse('2026-11-21T02:00:00Z') }))
})
