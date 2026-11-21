import { test as base, expect } from '@playwright/test'
import { installSdkStub } from './sdkStub.js'

export const BOAT_ID = '11111111-1111-4111-8111-111111111111'
export const RESERVATION_ID = '33333333-3333-4333-8333-333333333333'
export const DISPUTE_ID = '55555555-5555-4555-8555-555555555555'
export const NOW = Date.parse('2026-11-21T13:30:00Z')
export const selection = 'start=2026-11-22&end=2026-11-23&pax=2'
export const summary = `/explorar/${BOAT_ID}/pago?${selection}`
export const method = `/explorar/${BOAT_ID}/pago/metodo?${selection}`
const photo = '/test-vessel.svg'
const vessel = { vessel_id: BOAT_ID, name: 'Barco de prueba', type: 'CATAMARAN', max_capacity: 5,
  captain_included: true, port: { name: 'Puerto de prueba', timezone: 'America/Bogota' }, amenities: ['Capitán'], owner: { validated_name: 'Propietario de prueba' } }

export const pendingDispute = () => ({ dispute_id: DISPUTE_ID, reservation_id: RESERVATION_ID, status: 'PENDING',
  window_start: new Date(NOW).toISOString(), window_end: new Date(NOW + 86400000).toISOString(), claim: null })

export async function loginAs(page, role) {
  const id = role === 'RENTER' ? '22222222-2222-4222-8222-222222222222' : '66666666-6666-4666-8666-666666666666'
  const token = `test.${Buffer.from(JSON.stringify({ sub: id, role, exp: 4102444800 })).toString('base64url')}.test`
  await page.evaluate(({ role, id, token }) => {
    localStorage.setItem('seashare.role', role)
    localStorage.setItem('seashare.userId', id)
    localStorage.setItem('seashare.token', token)
  }, { role, id, token })
}

export const test = base.extend({
  state: async ({ page }, runFixture) => {
    const state = { status: 'INITIATED', created: false, dispute: null, requests: [], forbidden: [], errors: [],
      abandonmentSupported: true, detailSupported: true, loseCreateResponse: false, remarks: '' }
    page.on('pageerror', (error) => state.errors.push(error.message))
    await page.clock.install({ time: new Date(NOW) })
    await page.addInitScript(() => {
      if (!localStorage.getItem('seashare.role')) {
        localStorage.setItem('seashare.role', 'RENTER')
        localStorage.setItem('seashare.userId', '22222222-2222-4222-8222-222222222222')
      }
    })
    const reservation = () => ({ reservation_id: RESERVATION_ID, reservation_code: 'RS-TEST', status: state.status,
      vessel: { vessel_id: BOAT_ID, name: vessel.name, image_url: photo, included_services: vessel.amenities },
      itinerary: { scheduled_departure: '2026-11-22T10:00:00-05:00', scheduled_arrival: '2026-11-23T10:00:00-05:00',
        duration_days: 2, duration_nights: 1, passengers: 2, departure_port: { name: vessel.port.name, timezone: 'America/Bogota' } },
      renter: { name: 'TEST CONTACT' }, payment_summary: { estimated_total: 268000 },
      time_indicators: { ttl_remaining_seconds: 900 }, available_actions: { can_initiate_payment: state.status === 'INITIATED' } })
    await page.route('**/*', async (route) => {
      const request = route.request()
      const url = new URL(request.url())
      const verb = request.method()
      if (url.href === 'https://sdk.mercadopago.com/js/v2') return route.fulfill({ contentType: 'application/javascript', body: `(${installSdkStub.toString()})()` })
      if (url.origin === 'https://fonts.googleapis.com') return route.fulfill({ contentType: 'text/css', body: '' })
      if (url.origin !== 'http://127.0.0.1:5197') {
        state.forbidden.push(`${verb} ${url.href}`)
        return route.abort()
      }
      if (url.pathname === photo) return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300"><rect width="600" height="300" fill="#4267b5"/></svg>' })
      if (!url.pathname.startsWith('/api/')) return route.continue()
      state.requests.push({ method: verb, path: url.pathname, headers: request.headers(), body: request.postDataJSON() })
      const path = url.pathname
      const json = (body, status = 200) => route.fulfill({ status, json: body })
      if (path === '/api/m1/api/v1/notifications') return json({ notifications: [], unread_count: 0 })
      if (path === `/api/m1/api/v1/vessels/${BOAT_ID}`) return json({ ...vessel, photo_url: photo })
      if (path === '/api/m2/api/v1/vessels') return json({ vessels: [{ ...vessel, photo_url: photo }], pagination: { page: 1, total_pages: 1, total_items: 1 } })
      if (path === `/api/m2/api/v1/vessels/${BOAT_ID}`) return json(vessel)
      if (path.endsWith('/quotations')) return json({ total_days: 2, total_amount: 268000, currency: 'COP' })
      if (path === '/api/m3/api/v1/estimates/individual') return json({ duration_days: 2, passengers: 2, estimated_total: '268000.00' })
      if (path === '/api/m3/api/v1/estimates/batch') return json({ estimates: [{ boat_id: BOAT_ID, estimated_total: '134000.00' }], unavailable: [] })
      if (path.endsWith('/payment-confirmation')) return json({ status: 'IN_PROCESS', detail: null, external_reference: null })
      if (path.endsWith('/calculated-value')) return json({ rental_amount: '250000.00', insurance_amount: '18000.00', guarantee_deposit_amount: '12500.00', total_amount: '280500.00' })
      if (path === '/api/m2/api/v1/reservations') {
        if (verb === 'POST') {
          state.created = true
          state.status = 'INITIATED'
          if (state.loseCreateResponse) { state.loseCreateResponse = false; return route.abort() }
          return json({ reservation_id: RESERVATION_ID, status: state.status, ttl_expires_at: new Date(NOW + 900000).toISOString() }, 201)
        }
        return json({ reservations: state.created ? [reservation()] : [], pagination: { total_pages: 1 } })
      }
      if (path === `/api/m2/api/v1/reservations/${RESERVATION_ID}`) return json(reservation())
      if (path.endsWith('/abandonment')) {
        if (!state.abandonmentSupported) return json({ code: 'RESERVATION_NOT_FOUND' }, 404)
        state.status = 'EXPIRED'
        return json({ reservation_id: RESERVATION_ID, status: state.status })
      }
      if (path.endsWith('/payments')) { state.status = 'PENDING_PAYMENT'; return json({ reservation_id: RESERVATION_ID, status: state.status }) }
      if (path.endsWith('/navigation-end')) {
        state.status = 'COMPLETED'
        state.remarks = request.postDataJSON().remarks
        state.dispute = pendingDispute()
        return json({ reservation_id: RESERVATION_ID, status: state.status, dispute_id: DISPUTE_ID })
      }
      if (path === '/api/m2/api/v1/disputes') return json({ disputes: state.dispute ? [state.dispute] : [] })
      if (path === `/api/m2/api/v1/disputes/${DISPUTE_ID}`) {
        if (!state.detailSupported) return json({ code: 'RESERVATION_NOT_FOUND' }, 404)
        return json({ ...state.dispute, reservation: { reservation_code: 'RS-TEST', vessel_name: vessel.name,
          renter_name: 'TEST CONTACT', owner_name: 'Propietario de prueba', completion_notes: state.remarks } })
      }
      if (path.endsWith('/claims')) {
        state.dispute.claim = { ...request.postDataJSON(), claim_id: 'claim-test', registered_at: new Date(NOW).toISOString() }
        return json({ ...state.dispute, message: 'Reclamo registrado' }, 201)
      }
      if (path.endsWith('/status') && state.dispute) {
        const data = request.postDataJSON()
        Object.assign(state.dispute, { status: data.new_status, reason: data.reason, internal_notes: data.internal_notes, resolved_at: new Date(NOW).toISOString(), resolved_by: 'Administrador de prueba' })
        return json({ ...state.dispute, message: 'Disputa resuelta' })
      }
      state.forbidden.push(`${verb} ${path}`)
      return route.abort()
    })
    await runFixture(state)
    expect(state.forbidden, 'Ningún backend real ni recurso externo inesperado').toEqual([])
    expect(state.errors, 'Sin excepciones de React ni de navegador').toEqual([])
  },
})

export async function openMethod(page, url = summary) {
  await page.goto(url)
  await expect(page.getByRole('heading', { name: 'Pago', exact: true })).toBeVisible()
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Confirmar y Pagar', exact: true }).click()
}

export async function completeContact(page, time = '10:00') {
  await page.getByLabel('Nombre completo del contacto *', { exact: true }).fill('TEST CONTACT')
  await page.getByLabel('Teléfono de contacto *', { exact: true }).fill('+57 300 123 4567')
  await page.getByLabel('Hora de salida *', { exact: true }).fill(time)
  await page.getByRole('button', { name: 'Continuar al formulario seguro' }).click()
  await expect(page.getByTestId('sdk-stub')).toBeVisible()
}

export { expect }
