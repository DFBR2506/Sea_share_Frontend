import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  workers: 2,
  timeout: 30000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5197',
    timezoneId: 'America/Bogota',
    locale: 'es-CO',
    trace: 'off', video: 'off', screenshot: 'off',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5197 --strictPort',
    url: 'http://127.0.0.1:5197',
    reuseExistingServer: false,
    env: {
      // Sobrescribir .env y .env.local: jamás usar credenciales reales en E2E.
      VITE_MERCADOPAGO_PUBLIC_KEY: 'TEST-e2e-public-key',
      VITE_API_M1_URL: '/api/m1', VITE_API_M2_URL: '/api/m2', VITE_API_M3_URL: '/api/m3',
    },
  },
})
