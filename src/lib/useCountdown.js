import { useEffect, useState } from 'react'

/** Cuenta regresiva en segundos (se detiene en 0). */
export function useCountdown(initialSeconds) {
  const [left, setLeft] = useState(initialSeconds)
  useEffect(() => {
    const id = setInterval(() => setLeft((s) => Math.max(s - 1, 0)), 1000)
    return () => clearInterval(id)
  }, [])
  return left
}

export const formatMinSec = (s) => `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, '0')} s`
