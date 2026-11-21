export function sessionIdentity() {
  try {
    const role = localStorage.getItem('seashare.role')
    const token = localStorage.getItem('seashare.token')
    let userId = localStorage.getItem('seashare.userId')
    // Sesiones antiguas de M1 pueden conservar el JWT sin haber guardado userId.
    // Solo recupera su identidad; no valida el JWT ni concede un rol nuevo.
    if (!userId && token) {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      const claims = JSON.parse(atob(payload))
      if (claims.role === role && claims.exp * 1000 > Date.now()) userId = claims.sub
    }
    return { role, userId, token }
  } catch {
    return { role: null, userId: null, token: null }
  }
}
