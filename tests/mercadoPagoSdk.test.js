import assert from 'node:assert/strict'
import test from 'node:test'

async function sdkEnvironment(t) {
  const previousWindow = globalThis.window
  const previousDocument = globalThis.document
  const scripts = []
  globalThis.window = {}
  globalThis.document = {
    createElement: () => ({ remove() { this.removed = true } }),
    head: { appendChild: (script) => scripts.push(script) },
  }
  t.after(() => {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
    if (previousDocument === undefined) delete globalThis.document
    else globalThis.document = previousDocument
  })
  const { loadMercadoPagoSdk } = await import(`../src/features/reservations/checkout/mercadoPagoSdk.js?test=${t.name}`)
  return { scripts, loadMercadoPagoSdk }
}

test('la carga concurrente del SDK usa un único script oficial', async (t) => {
  const { scripts, loadMercadoPagoSdk } = await sdkEnvironment(t)
  const first = loadMercadoPagoSdk()
  const second = loadMercadoPagoSdk()
  assert.equal(first, second)
  assert.equal(scripts.length, 1)
  assert.equal(scripts[0].src, 'https://sdk.mercadopago.com/js/v2')
  const sdk = class {}
  window.MercadoPago = sdk
  scripts[0].onload()
  assert.equal(await first, sdk)
  assert.equal(await loadMercadoPagoSdk(), sdk)
  assert.equal(scripts.length, 1)
})

test('una falla de red permite reintentar sin conservar el script fallido', async (t) => {
  const { scripts, loadMercadoPagoSdk } = await sdkEnvironment(t)
  const first = loadMercadoPagoSdk()
  const rejection = assert.rejects(first)
  scripts[0].onerror()
  await rejection
  assert.equal(scripts[0].removed, true)
  const second = loadMercadoPagoSdk()
  assert.equal(scripts.length, 2)
  window.MercadoPago = class {}
  scripts[1].onload()
  await second
})

test('un script cargado sin constructor no se considera listo', async (t) => {
  const { scripts, loadMercadoPagoSdk } = await sdkEnvironment(t)
  const first = loadMercadoPagoSdk()
  const rejection = assert.rejects(first)
  scripts[0].onload()
  await rejection
  assert.equal(scripts[0].removed, true)
})
