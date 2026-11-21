import { useEffect, useState } from 'react'

export function useNow(interval = 30000) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const update = () => setNow(Date.now())
    const timer = setInterval(update, interval)
    window.addEventListener('focus', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [interval])
  return now
}
