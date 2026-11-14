import { test as base, expect } from '@playwright/test'
import { installSdkStub } from './sdkStub.js'

const selection = 'start=2026-11-20&end=2026-11-22&pax=2'
const summary = `/explorar/ocean-whisper/pago?${selection}`
const method = `/explorar/ocean-whisper/pago/metodo?${selection}`
const storedCheckout = (page) => page.evaluate(() => JSON.parse(sessionStorage.getItem('seashare.checkout.v1')))

const test = base.extend({
  page: async ({ page }, runTest) => {
    const forbidden = []
    const pageErrors = []
    const consoleMessages = []
    page.on('pageerror', (error) => pageErrors.push(error.message))
    page.on('console', (message) => consoleMessages.push(message.text()))
    await page.clock.install({ time: new Date('2026-11-10T12:00:00Z') })
    await page.addInitScript(() => { localStorage.setItem('seashare.role', 'RENTER') })
    await page.route('**/*', async (route) => {
      const url = new URL(route.request().url())
      if (url.href === 'https://sdk.mercadopago.com/js/v2') {
        return route.fulfill({ contentType: 'application/javascript', body: `(${installSdkStub.toString()})()` })
      }
      // Recurso global preexistente de index.html; aislarlo sin descargar fuentes.
      if (url.origin === 'https://fonts.googleapis.com' && url.pathname === '/css2') {
        return route.fulfill({ contentType: 'text/css', body: '' })
      }
      if (url.origin !== 'http://127.0.0.1:5197' || url.pathname.startsWith('/api/')) {
        forbidden.push(`${route.request().method()} ${url.origin}${url.pathname}`)
        return route.abort()
      }
      return route.continue()
    })
    await runTest(page)
    expect(forbidden, 'Sin intentos de backend ni red externa fuera de SDK/CSS interceptados').toEqual([])
    expect(pageErrors, 'Sin excepciones de navegador').toEqual([])
    for (const secret of ['e2e-synthetic-token', 'payer-e2e@example.com', '0012345678', 'TEST CONTACT', '+57 300 123 4567']) {
      expect(consoleMessages.some((message) => message.includes(secret)), 'Sin datos sensibles en consola').toBe(false)
    }
  },
})

async function openMethod(page) {
  await page.goto(summary)
  await expect(page.getByRole('heading', { name: 'Pago', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Confirmar y Pagar' })).toBeDisabled()
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Confirmar y Pagar' }).click()
  await expect(page.getByRole('heading', { name: 'Método de pago', exact: true })).toBeVisible()
}

async function completeContact(page) {
  await page.getByRole('button', { name: 'Continuar al formulario seguro' }).click()
  await expect(page.getByText('Ingresa el nombre completo del contacto.')).toBeVisible()
  await expect(page.getByLabel('Nombre completo del contacto *', { exact: true })).toBeFocused()
  await page.getByLabel('Nombre completo del contacto *', { exact: true }).fill('TEST CONTACT')
  await page.getByLabel('Teléfono de contacto *', { exact: true }).fill('+57 300 123 4567')
  await page.getByRole('button', { name: 'Continuar al formulario seguro' }).click()
}

async function openBrick(page) {
  await openMethod(page)
  await completeContact(page)
  await expect(page.getByTestId('sdk-stub')).toBeVisible()
}

test('Reservar abre el resumen sin diálogo; acceso directo no evita consentimiento', async ({ page }) => {
  await page.goto('/explorar/ocean-whisper')
  await page.getByRole('button', { name: '20 de noviembre de 2026', exact: true }).click()
  await page.getByRole('button', { name: '22 de noviembre de 2026', exact: true }).click()
  await page.getByRole('button', { name: 'Reservar', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Pago', exact: true })).toBeVisible()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.goto(method)
  await expect(page).toHaveURL(/\/pago\?start=/)
  await expect(page.getByRole('button', { name: 'Confirmar y Pagar' })).toBeDisabled()
})

test('volver y recargar conserva plazo y políticas, pero no contacto', async ({ page }) => {
  await openBrick(page)
  const original = await storedCheckout(page)
  await page.clock.fastForward(65000)
  await page.getByRole('button', { name: '‹ Volver al resumen' }).click()
  await expect(page.getByRole('checkbox')).toBeChecked()
  expect((await storedCheckout(page)).expiresAt).toBe(original.expiresAt)
  await page.reload()
  await expect(page.getByRole('checkbox')).toBeChecked()
  expect((await storedCheckout(page)).id).toBe(original.id)
  await page.getByRole('button', { name: 'Confirmar y Pagar' }).click()
  await expect(page.getByLabel('Nombre completo del contacto *', { exact: true })).toHaveValue('')
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Método de pago', exact: true })).toBeVisible()
  expect((await storedCheckout(page)).expiresAt).toBe(original.expiresAt)
})

test('captura desacoplada, doble callback, privacidad y limpieza al editar', async ({ page }) => {
  await openBrick(page)
  const original = await storedCheckout(page)
  await page.evaluate(() => window.__mpTest.submitDuplicate())
  await expect(page.getByText('Datos de pago obtenidos. No se ha realizado ningún cobro.')).toBeVisible()
  await page.getByText('Ver comprobación de datos (sin información sensible)').click()
  await expect(page.getByText('tokenPresent: true', { exact: true })).toBeVisible()
  await expect(page.getByText('paymentCreated: false', { exact: true })).toBeVisible()
  await expect(page.getByText('mode: detached', { exact: true })).toBeVisible()
  expect(await page.evaluate(() => window.__mpTest.duplicateShared)).toBe(true)
  const evidence = await page.locator('details').innerText()
  const storage = await page.evaluate(() => JSON.stringify({ local: { ...localStorage }, session: { ...sessionStorage } }))
  for (const sensitive of ['e2e-synthetic-token', 'payer-e2e@example.com', '0012345678', 'TEST CONTACT', '+57 300 123 4567']) {
    expect(evidence).not.toContain(sensitive)
    expect(storage).not.toContain(sensitive)
  }
  await page.getByRole('button', { name: 'Editar contacto' }).click()
  await expect(page.getByText('Datos de pago obtenidos. No se ha realizado ningún cobro.')).toHaveCount(0)
  await expect(page.getByTestId('sdk-stub')).toHaveCount(0)
  expect(await page.evaluate(() => window.__mpTest.unmounted)).toBeGreaterThan(0)
  expect((await storedCheckout(page)).expiresAt).toBe(original.expiresAt)
})

test('expirar desmonta el Brick y no renueva el checkout al recargar', async ({ page }) => {
  await openBrick(page)
  const original = await storedCheckout(page)
  await page.clock.fastForward(16 * 60 * 1000)
  await expect(page.getByRole('timer')).toContainText('EXPIRÓ')
  await expect(page.getByTestId('sdk-stub')).toHaveCount(0)
  expect(await page.evaluate(() => window.__mpTest.unmounted)).toBeGreaterThan(0)
  await page.reload()
  await expect(page.getByRole('timer')).toContainText('EXPIRÓ')
  expect((await storedCheckout(page)).expiresAt).toBe(original.expiresAt)
})

test('cambiar pasajeros invalida el consentimiento y el contexto anterior', async ({ page }) => {
  await openMethod(page)
  const original = await storedCheckout(page)
  await page.goto(method.replace('pax=2', 'pax=3'))
  await expect(page.getByRole('heading', { name: 'Pago', exact: true })).toBeVisible()
  await expect(page.getByRole('checkbox')).not.toBeChecked()
  expect((await storedCheckout(page)).id).not.toBe(original.id)
})

test('error de captura y recarga permiten reintentar sin renovar TTL', async ({ page }) => {
  await openBrick(page)
  const original = await storedCheckout(page)
  await page.evaluate(() => window.__mpTest.submitInvalid())
  await expect(page.getByRole('alert')).toContainText('No se pudieron capturar los datos')
  await page.getByRole('button', { name: 'Volver a cargar formulario' }).click()
  await expect(page.getByTestId('sdk-stub')).toBeVisible()
  expect(await page.evaluate(() => window.__mpTest.scriptLoads)).toBe(1)
  await page.getByRole('button', { name: 'Obtener datos de pago de prueba', exact: true }).click()
  await expect(page.getByText('Datos de pago obtenidos. No se ha realizado ningún cobro.')).toBeVisible()
  expect((await storedCheckout(page)).expiresAt).toBe(original.expiresAt)
})

test('tokens visuales, padding y ausencia de desbordamiento', async ({ page }, testInfo) => {
  await openMethod(page)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: testInfo.outputPath('contacto.png'), fullPage: true, scale: 'css' })
  await completeContact(page)
  await expect(page.getByTestId('sdk-stub')).toBeVisible()
  const appearance = await page.evaluate(() => {
    const variables = window.__mpTest.settings.customization.visual.style.customVariables
    const root = getComputedStyle(document.documentElement)
    const contact = document.querySelector('main')
    return {
      variables,
      space: root.getPropertyValue('--space-3').trim(),
      radius: root.getPropertyValue('--radius-md').trim(),
      font: getComputedStyle(contact).fontFamily,
      overflow: document.documentElement.scrollWidth > window.innerWidth,
    }
  })
  expect(appearance.variables.formPadding).toBe(appearance.space)
  expect(appearance.variables.borderRadiusMedium).toBe(appearance.radius)
  expect(appearance.variables.baseColor).toMatch(/^#[0-9a-f]{6}$/)
  expect(appearance.font).toContain('Inter')
  expect(appearance.overflow).toBe(false)
  await expect(page.getByTestId('sdk-stub')).toHaveCSS('padding', '12px')
  await page.evaluate(() => window.scrollTo(0, 0))
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0)
  await page.screenshot({ path: testInfo.outputPath('layout-doble-sdk.png'), fullPage: true, scale: 'css' })
})

test('atrás y adelante del navegador conservan el mismo contexto', async ({ page }) => {
  await openMethod(page)
  const original = await storedCheckout(page)
  await page.goBack()
  await expect(page.getByRole('checkbox')).toBeChecked()
  await page.goForward()
  await expect(page.getByRole('heading', { name: 'Método de pago', exact: true })).toBeVisible()
  expect((await storedCheckout(page)).id).toBe(original.id)
  expect((await storedCheckout(page)).expiresAt).toBe(original.expiresAt)
})

test('sin Public Key no se carga SDK ni se simula una captura', async ({ page }) => {
  await page.route('**/src/features/reservations/components/PaymentBrick.jsx*', async (route) => {
    const response = await route.fetch()
    const source = await response.text()
    expect(source).toContain('TEST-e2e-public-key')
    await route.fulfill({ response, body: source.replaceAll('TEST-e2e-public-key', '') })
  })
  await openMethod(page)
  await completeContact(page)
  await expect(page.locator('[data-payment-state="configuration_error"]')).toBeVisible()
  expect(await page.evaluate(() => typeof window.__mpTest)).toBe('undefined')
})

test('un fallo de descarga del SDK permite reintentar', async ({ page }) => {
  let failed = false
  await page.route('https://sdk.mercadopago.com/js/v2', async (route) => {
    if (!failed) { failed = true; return route.abort() }
    return route.fallback()
  })
  await openMethod(page)
  await completeContact(page)
  await expect(page.getByRole('alert')).toContainText('No se pudo cargar el formulario')
  await page.getByRole('button', { name: 'Volver a cargar formulario' }).click()
  await expect(page.getByTestId('sdk-stub')).toBeVisible()
  expect(failed).toBe(true)
})

test('un contexto inválido no abre el formulario ni conserva consentimiento', async ({ page }) => {
  await openMethod(page)
  await page.goto(method.replace('2026-11-20', '2026-02-30'))
  await expect(page.getByText('La reserva no es válida. Vuelve a elegir tus fechas.')).toBeVisible()
  await expect.poll(() => storedCheckout(page)).toBe(null)
  await expect(page.getByRole('button', { name: 'Obtener datos de pago de prueba', exact: true })).toHaveCount(0)
})

test('un plazo vencido solo se reinicia al pulsar Reservar otra vez', async ({ page }) => {
  await openMethod(page)
  const original = await storedCheckout(page)
  await page.clock.fastForward(16 * 60 * 1000)
  await page.getByRole('button', { name: 'Volver a la embarcación', exact: true }).click()
  await page.getByRole('button', { name: '20 de noviembre de 2026', exact: true }).click()
  await page.getByRole('button', { name: '22 de noviembre de 2026', exact: true }).click()
  await page.getByRole('button', { name: 'Reservar', exact: true }).click()
  await expect(page.getByRole('checkbox')).not.toBeChecked()
  const next = await storedCheckout(page)
  expect(next.id).not.toBe(original.id)
  expect(next.expiresAt).toBeGreaterThan(original.expiresAt)
})

test('storage bloqueado permite completar el recorrido en memoria', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Storage bloqueado en E2E') } })
  })
  await openBrick(page)
  await page.getByRole('button', { name: 'Obtener datos de pago de prueba', exact: true }).click()
  await expect(page.getByText('Datos de pago obtenidos. No se ha realizado ningún cobro.')).toBeVisible()
  await page.getByRole('button', { name: '‹ Volver al resumen' }).click()
  await expect(page.getByRole('checkbox')).toBeChecked()
})
