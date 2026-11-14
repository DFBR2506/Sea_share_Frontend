import assert from 'node:assert/strict'
import test from 'node:test'
import { createPaymentFlow } from '../src/features/reservations/checkout/paymentFlow.js'
import { detachedPaymentAdapter } from '../src/features/reservations/checkout/detachedPaymentAdapter.js'

const now = 1800000000000
const result = () => ({
  selectedPaymentMethod: 'credit_card',
  formData: {
    token: 'sensitive-token', payment_method_id: 'visa', issuer_id: '123',
    installments: 1, transaction_amount: 10000,
    payer: { email: 'private@example.com', identification: { type: 'CC', number: '0012345678' } },
  },
})
const options = (overrides = {}) => ({
  checkoutId: 'local-checkout', contact: { name: 'Private Name', phone: '3001234567' },
  amount: 10000, expiresAt: now + 60000, now: () => now, ...overrides,
})
const deferred = () => {
  let resolve
  const promise = new Promise((done) => { resolve = done })
  return { promise, resolve }
}
const response = { mode: 'detached', outcome: 'tokenized', paymentCreated: false }

test('el adaptador confirma captura local, nunca aprobación ni un pago creado', async () => {
  const flow = createPaymentFlow(options())
  assert.equal(flow.snapshot.status, 'loading_sdk')
  flow.ready()
  assert.equal(flow.snapshot.status, 'ready')
  const pending = flow.submit(result())
  assert.equal(flow.snapshot.status, 'tokenizing')
  assert.deepEqual(await pending, response)
  assert.equal(flow.snapshot.status, 'tokenized')
  assert.equal(flow.hasCapturedPayment, true)
  assert.equal(flow.snapshot.evidence.paymentCreated, false)
  assert.equal(flow.snapshot.evidence.mode, 'detached')
  assert.equal(flow.snapshot.evidence.contactPhonePresent, true)
  const serialized = JSON.stringify(flow.snapshot)
  for (const value of ['sensitive-token', 'private@example.com', '0012345678', 'Private Name', '3001234567']) {
    assert.equal(serialized.includes(value), false)
  }
  flow.dispose()
  assert.equal(flow.hasCapturedPayment, false)
})

test('el doble envío comparte una promesa y una única invocación del adaptador', async () => {
  const entered = deferred()
  const finish = deferred()
  let calls = 0
  const flow = createPaymentFlow(options({ adapter: async () => { calls++; entered.resolve(); return finish.promise } }))
  const first = flow.submit(result())
  const second = flow.submit(result())
  assert.equal(first, second)
  await entered.promise
  assert.equal(calls, 1)
  finish.resolve(response)
  await first
  await assert.rejects(flow.submit(result()))
  assert.equal(calls, 1)
  flow.dispose()
})

test('rechaza antes del adaptador si el TTL ya venció', async () => {
  let calls = 0
  const flow = createPaymentFlow(options({ now: () => now + 60000, adapter: async () => { calls++ } }))
  await assert.rejects(flow.submit(result()))
  assert.equal(calls, 0)
  assert.equal(flow.snapshot.status, 'expired')
  assert.equal(flow.hasCapturedPayment, false)
})

test('revalida TTL justo antes de entregar datos al adaptador', async () => {
  let clock = now
  let calls = 0
  const flow = createPaymentFlow(options({ now: () => clock, adapter: async () => { calls++ } }))
  const pending = flow.submit(result())
  clock += 60000
  await assert.rejects(pending)
  assert.equal(calls, 0)
  assert.equal(flow.snapshot.status, 'expired')
})

test('descarta el resultado si el plazo vence durante la operación asíncrona', async () => {
  let clock = now
  const entered = deferred()
  const finish = deferred()
  let signal
  const flow = createPaymentFlow(options({ now: () => clock, adapter: async (_, opts) => {
    signal = opts.signal; entered.resolve(); return finish.promise
  } }))
  const pending = flow.submit(result())
  await entered.promise
  clock += 60000
  finish.resolve(response)
  await assert.rejects(pending)
  assert.equal(signal.aborted, true)
  assert.equal(flow.snapshot.status, 'expired')
  assert.equal(flow.snapshot.evidence, null)
  assert.equal(flow.hasCapturedPayment, false)
})

test('expirar explícitamente elimina una captura ya obtenida', async () => {
  const flow = createPaymentFlow(options())
  await flow.submit(result())
  flow.expire()
  assert.equal(flow.hasCapturedPayment, false)
  assert.equal(flow.snapshot.status, 'expired')
  assert.equal(flow.snapshot.evidence, null)
  flow.ready()
  await assert.rejects(flow.submit(result()))
})

test('salir cancela la señal e ignora respuestas tardías sin notificar a React', async () => {
  const entered = deferred()
  const finish = deferred()
  const updates = []
  let signal
  const flow = createPaymentFlow(options({ onChange: (view) => updates.push(view), adapter: async (_, opts) => {
    signal = opts.signal; entered.resolve(); return finish.promise
  } }))
  const pending = flow.submit(result())
  await entered.promise
  flow.dispose()
  const count = updates.length
  finish.resolve(response)
  await assert.rejects(pending)
  assert.equal(signal.aborted, true)
  assert.equal(flow.hasCapturedPayment, false)
  assert.equal(updates.length, count)
})

test('un error permite reintentar y nunca propaga mensajes con datos sensibles', async () => {
  let calls = 0
  const flow = createPaymentFlow(options({ adapter: async () => {
    if (++calls === 1) throw new Error('sensitive-token private@example.com')
    return response
  } }))
  await assert.rejects(flow.submit(result()), (error) => !error.message.includes('sensitive-token'))
  assert.equal(flow.snapshot.status, 'error')
  assert.equal(flow.hasCapturedPayment, false)
  assert.equal(flow.snapshot.message.includes('private@example.com'), false)
  await flow.submit(result())
  assert.equal(flow.snapshot.status, 'tokenized')
  flow.dispose()
})

test('una respuesta financiera simulada no se acepta como tokenización', async () => {
  const flow = createPaymentFlow(options({ adapter: async () => ({ status: 'APPROVED', paymentCreated: true }) }))
  await assert.rejects(flow.submit(result()))
  assert.equal(flow.snapshot.status, 'error')
  assert.equal(flow.hasCapturedPayment, false)
})

test('datos inválidos no alcanzan el adaptador', async () => {
  let calls = 0
  const flow = createPaymentFlow(options({ adapter: async () => { calls++ } }))
  await assert.rejects(flow.submit({ ...result(), formData: { token: '' } }))
  assert.equal(calls, 0)
  assert.equal(flow.snapshot.status, 'error')
})

test('el adaptador local respeta cancelación e incompletitud', async () => {
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(detachedPaymentAdapter({}, { signal: controller.signal }))
  await assert.rejects(detachedPaymentAdapter({}))
})
