import { test, expect, DISPUTE_ID, NOW, RESERVATION_ID, loginAs, pendingDispute } from './reservationsFixture.js'

test('finalizar el viaje abre garantía; el reclamo del propietario aparece en administración', async ({ page, state }) => {
  state.status = 'IN_NAVIGATION'
  state.created = true
  await page.goto('/explorar')
  await loginAs(page, 'OWNER')
  await page.goto(`/owner/reservas/${RESERVATION_ID}`)
  await page.getByRole('button', { name: 'Marcar fin de la navegación' }).click()
  await page.getByLabel('Novedades al cierre (opcional)').fill('El motor presentó un daño al regreso.')
  await page.getByRole('button', { name: 'Finalizar viaje', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Reportar reclamo', exact: true })).toBeEnabled()
  expect(state.dispute.dispute_id).toBe(DISPUTE_ID)
  await page.getByRole('button', { name: 'Reportar reclamo', exact: true }).click()
  await page.getByLabel('Describe lo ocurrido').fill('El motor se recibió con un daño visible.')
  await page.getByLabel('Categoría del reclamo (opcional)').click()
  await page.getByRole('option', { name: 'Motor', exact: true }).click()
  await page.getByLabel('Enlaces de evidencia (opcional, máximo 5)').fill('https://example.test/evidencia.jpg')
  await page.getByRole('button', { name: 'Enviar reclamo', exact: true }).click()
  await expect(page.getByText('Tu reclamo', { exact: true })).toBeVisible()
  expect(state.dispute.claim.damage_category).toBe('engine')
  await page.getByRole('button', { name: 'Cerrar', exact: true }).first().click()
  await loginAs(page, 'ADMIN')
  await page.goto('/admin/disputas')
  await expect(page.getByText('El motor se recibió con un daño visible.', { exact: true })).toBeVisible()
  await expect(page.getByText('El motor presentó un daño al regreso.', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver evidencia 1' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Aceptar reclamo', exact: true })).toBeEnabled()
  const ends = state.requests.filter((r) => r.path.endsWith('/navigation-end'))
  expect(ends).toHaveLength(1)
})

test('sin detalle ampliado no pide otro login ni consulta reservas prohibidas para el admin', async ({ page, state }) => {
  state.dispute = pendingDispute()
  state.detailSupported = false
  await page.goto('/explorar')
  await loginAs(page, 'ADMIN')
  await page.evaluate(() => localStorage.removeItem('seashare.userId'))
  await page.goto('/admin/disputas')
  await expect(page.getByRole('heading', { name: 'Resolución de disputas', exact: true })).toBeVisible()
  await expect(page.getByText('Todavía no hay un reclamo formal.')).toBeVisible()
  await expect(page.getByRole('alert')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Aceptar reclamo', exact: true })).toBeDisabled()
  const requests = state.requests.filter((r) => r.path.includes('/disputes'))
  expect(requests.every((r) => r.headers['x-user-role'] === 'ADMIN' && r.headers['x-user-id'])).toBe(true)
  expect(state.requests.some((r) => r.path.includes('/reservations/'))).toBe(false)
})

test('el admin puede resolver un reclamo presentado a tiempo después de cerrar la ventana; se conserva al recargar', async ({ page, state }) => {
  state.dispute = { ...pendingDispute(), window_end: new Date(NOW - 1).toISOString(),
    claim: { description: 'Daño acreditado por el propietario', registered_at: new Date(NOW - 3600000).toISOString(), evidence_urls: [] } }
  await page.goto('/explorar')
  await loginAs(page, 'ADMIN')
  await page.goto('/admin/disputas')
  await page.getByLabel('Motivo de la resolución (opcional, solo informativo)').fill('Evidencia suficiente')
  await page.getByLabel('Notas internas').fill('Revisión administrativa de prueba')
  await page.getByRole('button', { name: 'Aceptar reclamo', exact: true }).click()
  await page.getByRole('button', { name: 'Confirmar', exact: true }).dblclick()
  await expect(page.getByText('Disputa resuelta: ACEPTADO.', { exact: false })).toBeVisible()
  expect(state.requests.filter((r) => r.method === 'PUT')).toHaveLength(1)
  await page.reload()
  await expect(page.getByText('Disputa resuelta: ACEPTADO.', { exact: false })).toContainText('Evidencia suficiente')
  await expect(page.getByText('Notas internas: Revisión administrativa de prueba')).toBeVisible()
})

test('el propietario no puede enviar reclamos fuera de la ventana de 24 horas', async ({ page, state }) => {
  state.status = 'COMPLETED'
  state.created = true
  state.dispute = { ...pendingDispute(), window_end: new Date(NOW).toISOString() }
  await page.goto('/explorar')
  await loginAs(page, 'OWNER')
  await page.goto(`/owner/reservas/${RESERVATION_ID}`)
  await expect(page.getByText('La ventana para reportar un reclamo está cerrada.')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Reportar reclamo', exact: true })).toBeDisabled()
  expect(state.requests.filter((r) => r.path.endsWith('/claims'))).toHaveLength(0)
})
