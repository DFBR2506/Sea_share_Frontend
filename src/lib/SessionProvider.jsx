import { useCallback, useMemo, useState } from 'react'
import { request } from './http'
import { SessionContext } from './sessionContext'

const STORAGE_KEY = 'seashare.role'
const USER_ID_KEY = 'seashare.userId'
const TOKEN_KEY = 'seashare.token'

// M1 solo conoce OWNER y ADMIN (login real con JWT). RENTER y FINADMIN aún no tienen cuenta en
// ningún backend: entran con un id fijo de desarrollo (UUID v4) que M2/M3 leen como X-User-Id.
const DEV_USER_IDS = {
  RENTER: '22222222-2222-4222-8222-222222222222',
  FINADMIN: '44444444-4444-4444-8444-444444444444',
}

// El rol se restaura solo si hay credencial detrás: token de M1 (OWNER/ADMIN) o id de desarrollo.
function readRole() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if ((stored === 'OWNER' || stored === 'ADMIN') && !localStorage.getItem(TOKEN_KEY)) return null
    return stored
  } catch {
    return null
  }
}

function persist(role, userId, token) {
  try {
    localStorage.setItem(STORAGE_KEY, role)
    if (userId) localStorage.setItem(USER_ID_KEY, userId)
    else localStorage.removeItem(USER_ID_KEY)
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // sin persistencia: la sesión vive solo en memoria
  }
}

export function SessionProvider({ children }) {
  const [role, setRole] = useState(readRole)

  // Acceso de desarrollo para los roles sin cuenta en backend (RENTER, FINADMIN).
  const login = useCallback((next) => {
    setRole(next)
    persist(next, DEV_USER_IDS[next], null)
  }, [])

  // Login real contra M1: devuelve el rol del usuario y guarda el JWT y su id.
  const signIn = useCallback(async ({ documentNumber, password }) => {
    const data = await request('m1', '/api/v1/auth/login', {
      method: 'POST',
      body: { document_number: documentNumber, password },
    })
    persist(data.user.role, data.user.id, data.access_token)
    setRole(data.user.role)
    return data.user.role
  }, [])

  const logout = useCallback(() => {
    setRole(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(USER_ID_KEY)
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      // nada que limpiar
    }
  }, [])

  const value = useMemo(() => ({ role, login, signIn, logout }), [role, login, signIn, logout])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
