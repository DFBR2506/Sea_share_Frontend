// MercadoPago admite una instancia de Payment Brick a la vez. Serializar también
// el desmontaje pendiente evita carreras al navegar y con React StrictMode.
let previousRelease = Promise.resolve()

export function mountPaymentBrick({ loadSdk, publicKey, target, settings }) {
  const previous = previousRelease
  let release
  previousRelease = new Promise((resolve) => { release = resolve })
  let disposed = false
  let controller
  let cleanup

  const unmount = async () => {
    const current = controller
    controller = undefined
    if (current) await current.unmount()
  }

  const ready = previous.then(async () => {
    if (disposed) return
    const MercadoPago = await loadSdk()
    if (disposed) return
    const mp = new MercadoPago(publicKey, { locale: 'es-CO' })
    controller = await mp.bricks().create('payment', target, settings)
    if (disposed) await unmount()
  }).catch((error) => {
    release()
    throw error
  })

  return {
    ready,
    dispose() {
      disposed = true
      cleanup ??= ready.catch(() => {}).then(unmount).finally(release)
      return cleanup
    },
  }
}
