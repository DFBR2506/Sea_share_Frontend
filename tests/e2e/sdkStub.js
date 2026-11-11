// DOBLE de SDK, no tokenización real. Solo se inyecta interceptando el script
// oficial en Playwright. Nunca se importa desde el código de producción.
export function installSdkStub() {
  const observations = { created: 0, unmounted: 0, scriptLoads: 1, settings: null, duplicateShared: false }
  window.__mpTest = observations
  window.MercadoPago = class {
    constructor(key, options) {
      if (key !== 'TEST-e2e-public-key' || options.locale !== 'es-CO') throw new Error('Configuración E2E inesperada')
    }
    bricks() {
      return { create: async (type, target, settings) => {
        if (type !== 'payment') throw new Error('Brick incorrecto')
        observations.created++
        observations.settings = { initialization: settings.initialization, customization: settings.customization }
        const host = document.getElementById(target)
        const wrapper = document.createElement('div')
        wrapper.dataset.testid = 'sdk-stub'
        wrapper.style.padding = settings.customization.visual.style.customVariables.formPadding
        wrapper.innerHTML = '<p>Doble de SDK: no representa campos PCI reales.</p><button type="button">Obtener datos de pago de prueba</button>'
        host.appendChild(wrapper)
        const result = () => ({
          selectedPaymentMethod: 'credit_card',
          formData: {
            token: 'e2e-synthetic-token', issuer_id: '123', payment_method_id: 'visa',
            transaction_amount: settings.initialization.amount, installments: 1,
            payer: { email: 'payer-e2e@example.com', identification: { type: 'CC', number: '0012345678' } },
          },
        })
        const extra = { lastFourDigits: '4242', cardholderName: 'TEST CARDHOLDER', bin: '12345678' }
        observations.submitDuplicate = async () => {
          const first = settings.callbacks.onSubmit(result(), extra)
          const second = settings.callbacks.onSubmit(result(), extra)
          observations.duplicateShared = first === second
          await Promise.all([first, second])
        }
        observations.submitInvalid = async () => {
          const invalid = result()
          invalid.formData.token = ''
          await settings.callbacks.onSubmit(invalid, extra).catch(() => {})
        }
        wrapper.querySelector('button').onclick = () => settings.callbacks.onSubmit(result(), extra).catch(() => {})
        settings.callbacks.onReady()
        return { unmount: () => { observations.unmounted++; wrapper.remove() } }
      } }
    }
  }
}
