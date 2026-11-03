import { useCallback, useMemo, useState } from 'react'
import { SessionContext } from './sessionContext'

const STORAGE_KEY = 'seashare.role'

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
    } catch {
      // sin persistencia: la sesión vive solo en memoria
    }
  }, [])

  const logout = useCallback(() => {
    setRole(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // nada que limpiar
    }
  }, [])

  const value = useMemo(() => ({ role, login, logout }), [role, login, logout])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
