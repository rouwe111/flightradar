import { useEffect, useMemo, useState } from 'react'
import { useConfig } from '@/hooks/config-context'
import { ERROR_AFTER_FAILURES, MAX_BACKOFF_MS } from '@/hooks/constants'
import { decorate } from '@/lib/geo'
import type { SkyPayload, SkyPlane } from '@/lib/types'

/**
 * Polls the server on an interval. Nothing is asked while the tab is hidden,
 * so a screen nobody looks at costs nothing, and a check runs as soon as the
 * tab is visible again. After a failure the wait doubles, up to 2 minutes.
 */
export function useSky(radius: number) {
  const config = useConfig()
  const [data, setData] = useState<SkyPayload | null>(null)
  const [failures, setFailures] = useState(0)
  const [fetching, setFetching] = useState(false)

  useEffect(() => {
    let stopped = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let controller: AbortController | undefined
    let misses = 0

    const schedule = () => {
      const wait =
        misses === 0
          ? config.pollMs
          : Math.min(MAX_BACKOFF_MS, config.pollMs * 2 ** misses)
      timer = setTimeout(check, wait)
    }
    const check = async () => {
      clearTimeout(timer)
      if (stopped) return
      if (document.visibilityState === 'hidden') {
        schedule()
        return
      }
      controller = new AbortController()
      setFetching(true)
      try {
        const response = await fetch(`/api/sky?radius=${radius}`, {
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Answered ${response.status}`)
        const payload = (await response.json()) as SkyPayload
        if (stopped) return
        misses = 0
        setFailures(0)
        setData(payload)
      } catch {
        if (stopped) return
        misses += 1
        setFailures(misses)
      }
      if (stopped) return
      setFetching(false)
      schedule()
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') void check()
    }
    document.addEventListener('visibilitychange', onVisible)
    void check()
    return () => {
      stopped = true
      clearTimeout(timer)
      controller?.abort()
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [config.pollMs, radius])

  // Only new data makes new plane objects: the fetching flag flips twice per
  // poll and must not make the screens redraw or recompute anything.
  const parsed = useMemo(() => {
    const home = config.home
    const planes: Array<SkyPlane> = data
      ? data.planes.map((plane) => decorate(plane, home))
      : []
    const flightPlane = data?.flight?.plane
      ? decorate(data.flight.plane, home)
      : null
    return {
      home,
      planes,
      flight: data?.flight
        ? {
            number: data.flight.number,
            callsign: data.flight.callsign,
            plane: flightPlane,
            checked: data.flight.checked,
          }
        : null,
      updatedAt: data?.updatedAt ?? null,
    }
  }, [data, config.home])
  return {
    ...parsed,
    // Two failures in a row: one miss is usually a hiccup.
    status:
      failures >= ERROR_AFTER_FAILURES
        ? ('error' as const)
        : data
          ? ('ok' as const)
          : ('loading' as const),
    /** True while a check is running, including the first one. */
    fetching,
  }
}
