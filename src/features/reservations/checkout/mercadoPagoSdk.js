const SDK_URL = 'https://sdk.mercadopago.com/js/v2'
let loading

export function loadMercadoPagoSdk() {
  if (window.MercadoPago) return Promise.resolve(window.MercadoPago)
  if (loading) return loading

  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = SDK_URL
    script.async = true
    const cleanup = () => {
      clearTimeout(timeout)
      script.onload = null
      script.onerror = null
    }
    const fail = () => {
      cleanup()
      script.remove()
      reject(new Error('No se pudo cargar el SDK de MercadoPago.'))
    }
    const timeout = setTimeout(fail, 20000)
    script.onload = () => {
      if (!window.MercadoPago) return fail()
      cleanup()
      resolve(window.MercadoPago)
    }
    script.onerror = fail
    document.head.appendChild(script)
  }).catch((error) => {
    loading = undefined
    throw error
  })

  return loading
}
