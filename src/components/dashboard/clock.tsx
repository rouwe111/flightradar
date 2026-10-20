import { useEffect, useState } from 'react'

/** HH:MM, re-rendered once a minute (on the minute), not the whole page. */
export function Clock({ timezone }: { timezone?: string }) {
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      const at = Date.now()
      setNow(at)
      timer = setTimeout(tick, 60_000 - (at % 60_000) + 50)
    }
    tick()
    return () => clearTimeout(timer)
  }, [])
  return (
    <div className="ov-clock">
      {now
        ? new Date(now).toLocaleTimeString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timezone,
          })
        : ''}
    </div>
  )
}
