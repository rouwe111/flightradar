import { useEffect, useState } from 'react'

/** Current time, null until mounted so the server never renders a clock. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), ms)
    return () => clearInterval(id)
  }, [ms])
  return now
}
