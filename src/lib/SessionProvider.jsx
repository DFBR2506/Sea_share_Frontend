import { useCallback, useMemo, useState } from 'react'
import { SessionContext } from './sessionContext'

const STORAGE_KEY = 'seashare.role'
const USER_ID_KEY = 'seashare.userId'

// IDs fijos de desarrollo (UUID v4), uno por rol.
// Provisional hasta tener autenticación real con el backend.
const DEV_USER_IDS = {
  OWNER: '11111111-1111-4111-8111-111111111111',
  RENTER: '22222222-2222-4222-8222-222222222222',
  ADMIN: '33333333-3333-4333-8333-333333333333',
  FINADMIN: '44444444-4444-4444-8444-444444444444',
}

// Sesión provisional: solo guarda el rol elegido (sin autenticación real todavía).
function readRole() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function SessionProvider({ children }) {
  const [role, setRole] = useState(readRole)

  const login = useCallback((next) => {
    setRole(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
      // userId de desarrollo por rol; el backend lo lee como header X-User-Id
      const devId = DEV_USER_IDS[next]
      if (devId) localStorage.setItem(USER_ID_KEY, devId)
      else localStorage.removeItem(USER_ID_KEY)
    } catch {
      // sin persistencia: la sesión vive solo en memoria
    }
  }, [])

  const logout = useCallback(() => {
    setRole(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(USER_ID_KEY)
    } catch {
      // nada que limpiar
    }
  }, [])

  const value = useMemo(() => ({ role, login, logout }), [role, login, logout])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
