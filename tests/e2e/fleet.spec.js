import { expect, test } from '@playwright/test'

// Pantallas del módulo 1 (flota) con el backend M1 simulado: mapa de coordenadas, campana de
// notificaciones, borrador detectado, validaciones del registro y búsqueda de propietarios.

const BOAT = {
  boat_id: 'b1', name: 'Río Magdalena II', legal_registration: 'CP-05-1042-A', type: 'MOTORBOAT',
  status: 'AVAILABLE', max_capacity: 12, base_rate: '180000.00', is_new: true, photo_url: null,
  maintenance_by: null, review_requested: false,
  port: { name: 'Marina Fluvial Magdalena', latitude: '11.2408', longitude: '-74.1990' },
  services: { life_jackets: true, cooler_with_ice: true, sound_system: false, fishing_gear: true, diving_gear: false },
  owner: { owner_id: 'o1', full_name: 'Ana María Rodríguez Peña', document_number: '1.045.223.118', email: 'ana@seashare.co', phone: '3104567890' },
}
const BOAT2 = { ...BOAT, boat_id: 'b2', name: 'Perla del Caribe', legal_registration: 'CP-05-2210-B', type: 'YACHT', status: 'RESERVED', is_new: false }

const NOTIFICATIONS = {
  notifications: [
    { notification_id: 'n1', type: 'MAINTENANCE_NOTICE', read: false, created_at: new Date(Date.now() - 12 * 60000).toISOString(), vessel_id: 'b1', message: 'Tu embarcación Río Magdalena II (CP-05-1042-A) fue enviada a mantenimiento. Motivo: Revisión del motor y pintura del casco.' },
    { notification_id: 'n2', type: 'VESSEL_DELETED', read: false, created_at: new Date(Date.now() - 3 * 3600000).toISOString(), vessel_id: null, message: 'Tu embarcación Delfín Azul (CP-05-9001-C) fue eliminada. Motivo: Matrícula vencida.' },
    { notification_id: 'n3', type: 'VESSEL_AVAILABLE', read: true, created_at: new Date(Date.now() - 50 * 3600000).toISOString(), vessel_id: 'b1', message: 'Tu embarcación Río Magdalena II (CP-05-1042-A) vuelve a estar disponible.' },
  ],
  unread_count: 2,
}

const json = (body, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(body) })

async function stubM1(page, { role = 'OWNER', draft = null } = {}) {
  const state = { draft, draftCreates: 0, draftReads: 0 }
  await page.route('**/api/m1/**', (route) => {
    const url = new URL(route.request().url())
    const path = url.pathname.replace('/api/m1/api/v1', '')
    if (path === '/notifications') return route.fulfill(json(NOTIFICATIONS))
    if (path === '/fleet/boats') return route.fulfill(json({ boats: [BOAT, BOAT2] }))
    if (path === '/fleet/boats/draft') {
      if (route.request().method() === 'POST') {
        state.draftCreates += 1
        state.draft = { boat_id: 'draft-1', ...route.request().postDataJSON() }
        return route.fulfill(json(state.draft))
      }
      if (route.request().method() === 'DELETE') {
        state.draft = null
        return route.fulfill({ status: 204 })
      }
      state.draftReads += 1
      return state.draft ? route.fulfill(json(state.draft)) : route.fulfill(json({ detail: 'sin borrador' }, 404))
    }
    if (path === '/fleet/boats/legal-registration-availability') return route.fulfill(json({ available: true }))
    if (path === '/fleet/boat-types') return route.fulfill(json({ types: [
      { code: 'MOTORBOAT', name: 'Lancha', max_capacity: 12 }, { code: 'YACHT', name: 'Yate', max_capacity: 20 },
    ] }))
    if (path === '/admin/fleet/boats') return route.fulfill(json({ boats: [BOAT, BOAT2] }))
    if (path === '/admin/fleet/owners') return route.fulfill(json({ owners: [BOAT.owner] }))
    if (path === '/admin/owners') return route.fulfill(json({ owners: [BOAT.owner], has_more: true }))
    if (path.startsWith('/admin/owners/')) return route.fulfill(json(BOAT.owner))
    if (path.startsWith('/fleet/boats/') || path.startsWith('/admin/fleet/boats/')) return route.fulfill(json(BOAT))
    return route.fulfill(json({ detail: `sin stub para ${path}` }, 404))
  })
  await page.addInitScript((r) => {
    localStorage.setItem('seashare.role', r)
    localStorage.setItem('seashare.userId', 'o1')
    localStorage.setItem('seashare.token', 'token-de-prueba')
  }, role)
  return state
}

// El 404 del borrador inexistente es parte del flujo (getDraft lo captura): no es un fallo.
const watch = (page, problems) => {
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().includes('Failed to load resource')) problems.push(m.text())
  })
  page.on('pageerror', (e) => problems.push(String(e)))
}

test('propietario: lista, campana y ficha con mapa', async ({ page }) => {
  const problems = []
  watch(page, problems)
  await stubM1(page)

  await page.goto('/owner/embarcaciones')
  await expect(page.getByRole('heading', { name: 'Mis Embarcaciones Registradas' })).toBeVisible()
  await expect(page.getByText('Lancha')).toBeVisible()
  await expect(page.getByRole('button', { name: /2 sin leer/ })).toBeVisible()

  await page.getByRole('button', { name: /2 sin leer/ }).click()
  await expect(page.getByRole('region', { name: 'Notificaciones' })).toBeVisible()
  await page.getByRole('button', { name: 'Revisar completamente' }).click()
  await expect(page.getByRole('heading', { name: 'Detalle de Notificación' })).toBeVisible()
  await expect(page.getByText('Revisión del motor y pintura del casco.')).toBeVisible()
  await page.getByRole('button', { name: 'Entendido y cerrar' }).click()
  await page.keyboard.press('Escape')

  await page.goto('/owner/embarcaciones/b1')
  await expect(page.getByRole('heading', { name: 'Río Magdalena II' })).toBeVisible()
  await expect(page.getByText('12 pasajeros')).toBeVisible()
  await expect(page.getByText('Tarifa base (por día)', { exact: true })).toBeVisible()
  await expect(page.getByText('Lat: 11.2408 · Long: -74.1990')).toBeVisible()
  await expect(page.locator('.leaflet-tile-loaded').first()).toBeVisible({ timeout: 20000 })
  expect(problems, problems.join('\n---\n')).toEqual([])
})

test('propietario: registro paso 2 con mapa y validaciones', async ({ page }) => {
  const problems = []
  watch(page, problems)
  const state = await stubM1(page)

  await page.goto('/owner/embarcaciones/nueva')
  await page.getByLabel('Nombre de la embarcación').fill('ab')
  await page.getByRole('button', { name: /Siguiente/ }).click()
  await expect(page.getByText(/El nombre debe tener entre 3 y 50/)).toBeVisible()
  await expect(page.getByText('Este campo es obligatorio para continuar con el registro').first()).toBeVisible()

  await page.getByLabel('Nombre de la embarcación').fill('Río Magdalena III')
  await page.getByLabel('Matrícula legal').fill('CP-05-7788-D')
  await page.getByRole('combobox', { name: 'Tipo de embarcación' }).click()
  await page.getByRole('option', { name: 'Lancha', exact: true }).click()
  await page.getByLabel(/Capacidad máxima/).fill('8')
  await page.getByRole('button', { name: /Siguiente/ }).click()

  await expect(page.getByText('Paso 2 de 2:', { exact: false })).toBeVisible()
  await expect.poll(() => state.draftReads).toBeGreaterThan(1)
  await expect(page.getByRole('heading', { name: 'Borrador detectado' })).toHaveCount(0)
  await page.getByRole('button', { name: 'Atrás', exact: true }).click()
  await page.getByRole('button', { name: /Siguiente/ }).click()
  expect(state.draftCreates).toBe(1)
  const map = page.getByRole('application', { name: /puerto de atraque/i })
  await expect(map).toBeVisible()
  await expect(page.locator('.leaflet-tile-loaded').first()).toBeVisible({ timeout: 20000 })
  const box = await map.boundingBox()
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
  await expect(page.getByLabel('Latitud')).not.toHaveValue('')
  await page.getByLabel('Nombre del puerto').fill('Marina Fluvial Magdalena')
  await page.getByLabel('Tarifa base (por día en COP)').fill('180000')
  await page.getByLabel('Equipo de buceo').check()
  const reads = state.draftReads
  await page.evaluate(() => window.dispatchEvent(new Event('visibilitychange')))
  await expect.poll(() => state.draftReads).toBeGreaterThan(reads)
  await expect(page.getByLabel('Nombre del puerto')).toHaveValue('Marina Fluvial Magdalena')
  await expect(page.getByLabel('Tarifa base (por día en COP)')).toHaveValue('180000')
  await expect(page.getByLabel('Equipo de buceo')).toBeChecked()
  await expect(page.getByRole('heading', { name: 'Borrador detectado' })).toHaveCount(0)

  await page.getByRole('button', { name: '← Volver', exact: true }).click()
  await page.goto('/owner/embarcaciones/nueva')
  await expect(page.getByRole('heading', { name: 'Borrador detectado' })).toBeVisible()
  await page.getByRole('button', { name: 'Continuar registro pendiente' }).click()
  await expect(page.getByLabel('Nombre del puerto')).toHaveValue('Marina Fluvial Magdalena')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Borrador detectado' })).toBeVisible()
  await page.getByRole('button', { name: 'Continuar registro pendiente' }).click()
  await expect(page.getByLabel('Tarifa base (por día en COP)')).toHaveValue('180000')
  expect(problems, problems.join('\n---\n')).toEqual([])
})

test('propietario: ventana de borrador detectado', async ({ page }) => {
  const problems = []
  watch(page, problems)
  await stubM1(page, { draft: { boat_id: 'draft-1', name: 'Río Magdalena III', legal_registration: 'CP-05-7788-D', type: 'MOTORBOAT', max_capacity: 8 } })

  await page.goto('/owner/embarcaciones/nueva')
  await expect(page.getByRole('heading', { name: 'Borrador detectado' })).toBeVisible()
  await expect(page.getByText('“Río Magdalena III”')).toBeVisible()

  await page.getByRole('button', { name: 'Empezar un registro nuevo' }).click()
  await expect(page.getByRole('heading', { name: '¿Iniciar nuevo registro?' })).toBeVisible()

  await page.getByRole('button', { name: 'Regresar' }).click()
  await page.getByRole('button', { name: 'Continuar registro pendiente' }).click()
  await expect(page.getByText('Paso 2 de 2:', { exact: false })).toBeVisible()
  // El paso 1 se retoma bloqueado: los datos legales del borrador ya no se tocan.
  await page.getByRole('button', { name: 'Atrás' }).click()
  await expect(page.getByLabel('Nombre de la embarcación')).toHaveValue('Río Magdalena III')
  await expect(page.getByLabel('Nombre de la embarcación')).toBeDisabled()
  await page.reload()
  await page.getByRole('button', { name: 'Empezar un registro nuevo' }).click()
  await page.getByRole('button', { name: 'Sí, eliminar y empezar' }).click()
  await expect(page.getByLabel('Nombre de la embarcación')).toHaveValue('')
  await expect(page.getByLabel('Nombre de la embarcación')).toBeEnabled()
  await expect(page.getByRole('heading', { name: 'Borrador detectado' })).toHaveCount(0)
  expect(problems, problems.join('\n---\n')).toEqual([])
})

test('editar: mapa precargado en el punto guardado', async ({ page }) => {
  const problems = []
  watch(page, problems)
  await stubM1(page)
  await page.goto('/owner/embarcaciones/b1/editar')
  await expect(page.getByRole('heading', { name: 'Editar Información de Embarcación' })).toBeVisible()
  await expect(page.getByLabel('Latitud')).toHaveValue('11.2408')
  await expect(page.getByLabel('Tarifa base (por día)')).toHaveValue('180000')
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(1)
  await expect(page.locator('.leaflet-tile-loaded').first()).toBeVisible({ timeout: 20000 })
  expect(problems, problems.join('\n---\n')).toEqual([])
})

test('administrador: búsqueda de propietario', async ({ page }) => {
  const problems = []
  watch(page, problems)
  await stubM1(page, { role: 'ADMIN' })
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Control General de Flota Fluvial' })).toBeVisible()
  await page.getByRole('combobox', { name: /Buscar propietario/ }).fill('Ana')
  await expect(page.getByRole('listbox')).toBeVisible()
  await expect(page.getByText('1.045.223.118')).toBeVisible()
  await expect(page.getByText(/Hay más resultados/)).toBeVisible()
  await page.getByRole('option').getByRole('button', { name: 'Ver Detalles' }).click()
  await expect(page.getByRole('heading', { name: 'Ana María Rodríguez Peña' })).toBeVisible()
  await expect(page.getByText('+57 310 456 7890')).toBeVisible()
  expect(problems, problems.join('\n---\n')).toEqual([])
})

test('pantallas de aviso: sin acceso y ruta inexistente', async ({ page }) => {
  const problems = []
  watch(page, problems)

  await page.goto('/sin-acceso')
  await expect(page.getByRole('heading', { name: 'No tienes acceso a esta pantalla' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Iniciar sesión' })).toBeVisible()

  await page.goto('/una-ruta-que-no-existe')
  await expect(page.getByRole('heading', { name: 'No encontramos esta página' })).toBeVisible()

  // Con sesión de otro rol la pantalla protegida explica el 403 en lugar de mandar al login.
  await page.addInitScript(() => {
    localStorage.setItem('seashare.role', 'RENTER')
    localStorage.setItem('seashare.userId', 'r1')
  })
  await page.goto('/owner/embarcaciones')
  await expect(page.getByRole('heading', { name: 'No tienes acceso a esta pantalla' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Ir a mi inicio' })).toBeVisible()
  expect(problems, problems.join('\n---\n')).toEqual([])
})
