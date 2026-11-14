import assert from 'node:assert/strict'
import test from 'node:test'
import {
  CHECKOUT_STORAGE_KEY, CHECKOUT_WINDOW_MS, clearExpiredCheckout,
  createCheckout, loadCheckout, remainingSeconds, restoreCheckout, saveCheckout,
} from '../src/features/reservations/checkout/checkoutState.js'

const now = 1800000000000
const snapshot = {
  boatId: 'ocean-whisper', start: '2026-11-20', end: '2026-11-22', pax: 2,
  price: { base: 1000, commission: 200, insurance: 40, deposit: 200, total: 1440 },
}
const memoryStorage = () => {
  const entries = new Map()
  return {
    getItem: (key) => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: (key) => entries.delete(key),
  }
}

test('crea un checkout de quince minutos sin consentimiento', () => {
  const checkout = createCheckout(snapshot, now)
  assert.ok(checkout.id)
  assert.equal(checkout.accepted, false)
  assert.equal(checkout.expiresAt, now + CHECKOUT_WINDOW_MS)
})

test('volver o recargar conserva identidad, consentimiento y vencimiento', () => {
  const storage = memoryStorage()
  const checkout = { ...createCheckout(snapshot, now), accepted: true }
  saveCheckout(storage, checkout)
  assert.deepEqual(loadCheckout(storage, snapshot, now + 60000), checkout)
  assert.deepEqual(loadCheckout(storage, snapshot, now + 120000), checkout)
})

for (const [field, value] of [['boatId', 'other'], ['start', '2026-11-19'], ['end', '2026-11-23'], ['pax', 3], ['price', { ...snapshot.price, total: 1500 }]]) {
  test(`cambiar ${field} invalida la sesión y el consentimiento`, () => {
    const storage = memoryStorage()
    const original = { ...createCheckout(snapshot, now), accepted: true }
    saveCheckout(storage, original)
    const checkout = loadCheckout(storage, { ...snapshot, [field]: value }, now + 1000)
    assert.notEqual(checkout.id, original.id)
    assert.equal(checkout.accepted, false)
  })
}

test('una sesión vencida no renueva su plazo al recargar', () => {
  const storage = memoryStorage()
  const original = createCheckout(snapshot, now)
  saveCheckout(storage, original)
  assert.deepEqual(loadCheckout(storage, snapshot, original.expiresAt + 1), original)
  assert.equal(remainingSeconds(original.expiresAt, original.expiresAt + 1), 0)
})

test('la cuenta usa tiempo absoluto, incluso tras suspender la pestaña', () => {
  const expiresAt = now + CHECKOUT_WINDOW_MS
  assert.equal(remainingSeconds(expiresAt, now), 900)
  assert.equal(remainingSeconds(expiresAt, now + 125000), 775)
  assert.equal(remainingSeconds(expiresAt, expiresAt), 0)
  assert.equal(remainingSeconds(expiresAt, expiresAt + 10000), 0)
})

test('solo Reservar de nuevo permite eliminar una sesión vencida', () => {
  const storage = memoryStorage()
  const original = createCheckout(snapshot, now)
  saveCheckout(storage, original)
  clearExpiredCheckout(storage, now + 1000)
  assert.ok(storage.getItem(CHECKOUT_STORAGE_KEY))
  clearExpiredCheckout(storage, original.expiresAt)
  assert.equal(storage.getItem(CHECKOUT_STORAGE_KEY), null)
  assert.equal(loadCheckout(storage, snapshot, original.expiresAt).accepted, false)
})

test('storage corrupto o incompatible no restaura consentimiento', () => {
  const valid = createCheckout(snapshot, now)
  for (const raw of ['invalid', 'null', '{}', JSON.stringify({ ...valid, version: 2 }), JSON.stringify({ ...valid, expiresAt: valid.expiresAt + 1 })]) {
    assert.equal(restoreCheckout(raw, snapshot, now), null)
  }
})

test('no restaura propiedades ajenas al contrato no sensible', () => {
  const valid = createCheckout(snapshot, now)
  const restored = restoreCheckout(JSON.stringify({ ...valid, token: 'do-not-restore', contact: { email: 'private' } }), snapshot, now)
  assert.deepEqual(restored, valid)
})

test('storage bloqueado no impide un checkout en memoria', () => {
  const storage = {
    getItem: () => { throw new Error('blocked') },
    setItem: () => { throw new Error('blocked') },
  }
  const checkout = loadCheckout(storage, snapshot, now)
  assert.equal(checkout.accepted, false)
  assert.doesNotThrow(() => saveCheckout(storage, checkout))
})
