import { expect, test } from '@playwright/test'

// El catálogo de desarrollo monta cada barra superior en su propia raíz de React. Si alguna vuelve
// a anidarse en el router de la aplicación, la página entera cae en el error boundary.

test('catálogo: barras por rol, navegación y limpieza', async ({ page }) => {
  const problems = []
  page.on('console', (m) => { if (m.type() === 'error') problems.push(m.text()) })
  page.on('pageerror', (e) => problems.push(String(e)))

  await page.goto('/dev/components')
  const bars = page.locator('section header')
  await expect(bars).toHaveCount(5)
  // Cada barra simula su propia ruta: el ítem activo cambia de una a otra.
  await expect(bars.nth(0).locator('a[class*="active"]')).toHaveText('Panel General')
  await expect(bars.nth(1).locator('a[class*="active"]')).toHaveText('Mis Embarcaciones')
  await expect(bars.nth(3).locator('a[class*="active"]')).toHaveText('Explorar')

  // Salir de la página desmonta las raíces sueltas sin romper nada.
  await page.goto('/sin-acceso')
  await expect(page.getByRole('heading', { name: 'No tienes acceso a esta pantalla' })).toBeVisible()
  await page.goBack()
  await expect(page.locator('section header')).toHaveCount(5)

  expect(problems, problems.join('\n---\n')).toEqual([])
})
