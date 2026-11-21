import assert from 'node:assert/strict'
import test from 'node:test'
import { getBoat, getDispute, listReservations, submitClaim } from '../src/features/reservations/api/index.js'
import { mapVessel } from '../src/features/reservations/api/vesselMapper.js'

test('no pierde imagen ni zona horaria del catálogo', () => {
  const boat = mapVessel({ photo_url: 'https://example.test/boat.jpg', port: { timezone: 'America/Bogota' } })
  assert.equal(boat.imageUrl, 'https://example.test/boat.jpg')
  assert.equal(boat.timezone, 'America/Bogota')
})

test('compatibilidad con detalle sin imagen y sin endpoint ampliado de disputas', async (t) => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url) => {
    calls.push(url)
    if (url.includes('/disputes/')) return new Response('{}', { status: 404 })
    return Response.json(url.startsWith('/api/m1') ? { photo_url: 'https://example.test/photo.jpg' } : { vessel_id: 'boat', max_capacity: 5 })
  })
  assert.equal((await getBoat('boat')).imageUrl, 'https://example.test/photo.jpg')
  assert.equal(await getDispute('dispute'), null)
  assert.equal(calls.some((url) => url.includes('/reservations/')), false)
})

test('lista todas las páginas de reservas y conserva los campos del reclamo', async (t) => {
  const calls = []
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    calls.push({ url, options })
    if (options.method === 'POST') return Response.json({ status: 'PENDING' })
    return Response.json({ reservations: [{ reservation_id: url, vessel: { vessel_id: 'boat' }, status: 'RESERVED' }], pagination: { total_pages: 2 } })
  })
  assert.equal((await listReservations()).length, 2)
  const claim = { description: 'Daño en el motor del barco', damage_category: 'engine', evidence_urls: ['https://example.test/a'] }
  await submitClaim('dispute', claim)
  assert.deepEqual(JSON.parse(calls.at(-1).options.body), claim)
})
