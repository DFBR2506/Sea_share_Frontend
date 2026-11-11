import assert from 'node:assert/strict'
import test from 'node:test'
import { mountPaymentBrick } from '../src/features/reservations/checkout/paymentBrickLifecycle.js'
import { paymentBrickSettings, tokenizationEvidence, validateTokenizedCard } from '../src/features/reservations/checkout/paymentBrickSettings.js'

// Dobles del SDK: validan el contrato y las carreras, no tokenizan tarjetas.
const card = {
  selectedPaymentMethod: 'credit_card',
  formData: {
    token: 'test-token', issuer_id: '1', payment_method_id: 'visa',
    transaction_amount: 10000, installments: 1,
    payer: { email: 'test@example.com', identification: { type: 'CC', number: '123456789' } },
  },
}

test('solo configura tarjetas, una cuota y el importe exacto, sin preferencia', () => {
  const callbacks = { onReady() {}, onError() {}, onSubmit: async () => {} }
  const settings = paymentBrickSettings(10000, callbacks)
  assert.deepEqual(settings.initialization, { amount: 10000 })
  assert.deepEqual(settings.customization.paymentMethods, {
    creditCard: 'all', debitCard: 'all', minInstallments: 1, maxInstallments: 1,
  })
  assert.equal(settings.callbacks, callbacks)
  assert.notEqual(settings.customization.visual.hidePaymentButton, true)
  for (const amount of [0, -1, NaN, Infinity, '10000']) {
    assert.throws(() => paymentBrickSettings(amount, callbacks))
  }
})

test('acepta el callback de tarjeta documentado y rechaza datos incompatibles', () => {
  assert.doesNotThrow(() => validateTokenizedCard(card, 10000))
  for (const patch of [
    { token: '' }, { payment_method_id: '' }, { installments: 2 },
    { transaction_amount: 9999 }, { transaction_amount: '10000' },
    { payer: { email: '' } }, { payer: { email: 'invalid' } },
  ]) assert.throws(() => validateTokenizedCard({ ...card, formData: { ...card.formData, ...patch } }, 10000))
  assert.throws(() => validateTokenizedCard({ selectedPaymentMethod: 'bank_transfer', formData: card.formData }, 10000))
  assert.throws(() => validateTokenizedCard(null, 10000))
})

test('la evidencia excluye token, correo, documento, nombre, BIN y últimos dígitos', () => {
  const evidence = tokenizationEvidence(card, { bin: '12345678', cardholderName: 'TEST PERSON', lastFourDigits: '4242' })
  assert.equal(evidence.tokenPresent, true)
  assert.equal(evidence.emailPresent, true)
  assert.equal(evidence.identificationPresent, true)
  assert.equal(evidence.lastFourPresent, true)
  assert.equal(evidence.paymentCreated, false)
  const json = JSON.stringify(evidence)
  for (const sensitive of ['test-token', 'test@example.com', '123456789', '12345678', 'TEST PERSON', '4242']) {
    assert.equal(json.includes(sensitive), false)
  }
})

const deferred = () => {
  let resolve
  const promise = new Promise((done) => { resolve = done })
  return { promise, resolve }
}

test('StrictMode: cancelar antes de cargar no crea una instancia huérfana', async () => {
  let creations = 0
  const sdk = class {
    bricks() { return { create: async () => { creations++; return { unmount() {} } } } }
  }
  const session = mountPaymentBrick({ loadSdk: async () => sdk, publicKey: 'test-public-key', target: 'one', settings: {} })
  await session.dispose()
  assert.equal(creations, 0)
})

test('cancelar durante la carga del SDK evita crear el Brick después', async () => {
  const loading = deferred()
  const entered = deferred()
  let creations = 0
  const sdk = class {
    bricks() { return { create: async () => { creations++; return { unmount() {} } } } }
  }
  const session = mountPaymentBrick({
    loadSdk: () => { entered.resolve(); return loading.promise }, publicKey: 'test-public-key', target: 'two', settings: {},
  })
  await entered.promise
  const cleanup = session.dispose()
  loading.resolve(sdk)
  await cleanup
  assert.equal(creations, 0)
})

test('desmonta una creación tardía antes de crear el siguiente Brick', async () => {
  const events = []
  const creating = deferred()
  const entered = deferred()
  const sdk = class {
    constructor(publicKey, options) {
      assert.equal(publicKey, 'test-public-key')
      assert.equal(options.locale, 'es-CO')
    }
    bricks() {
      return { create: async (type, target) => {
        assert.equal(type, 'payment')
        events.push(`create:${target}`)
        if (target === 'old') { entered.resolve(); await creating.promise }
        return { unmount: async () => { events.push(`unmount:${target}`) } }
      } }
    }
  }
  const options = { loadSdk: async () => sdk, publicKey: 'test-public-key', settings: {} }
  const old = mountPaymentBrick({ ...options, target: 'old' })
  await entered.promise
  const cleanup = old.dispose()
  const next = mountPaymentBrick({ ...options, target: 'new' })
  creating.resolve()
  await cleanup
  await next.ready
  assert.deepEqual(events, ['create:old', 'unmount:old', 'create:new'])
  await next.dispose()
  await next.dispose()
  assert.equal(events.filter((event) => event === 'unmount:new').length, 1)
})

test('un error al crear no bloquea futuros intentos', async () => {
  const failed = mountPaymentBrick({ loadSdk: async () => { throw new Error('offline') }, settings: {} })
  await assert.rejects(failed.ready)
  await failed.dispose()
  let unmounted = false
  const sdk = class { bricks() { return { create: async () => ({ unmount: () => { unmounted = true } }) } } }
  const next = mountPaymentBrick({ loadSdk: async () => sdk, settings: {} })
  await next.ready
  await next.dispose()
  assert.equal(unmounted, true)
})
