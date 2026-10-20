import { useEffect, useRef, useState } from 'react'
import { useConfig } from '@/hooks/config-context'

/**
 * Keeps the screen awake, hides the idle cursor (and the reload button)
 * after IDLE_SECONDS, wakes on a tap, mouse move or key. Fullscreen on F or
 * double-click, reload on R.
 */
export function useKiosk() {
  const { idleMs } = useConfig()
  const [idle, setIdle] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    let lock: WakeLockSentinel | undefined
    const acquire = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          lock = await navigator.wakeLock.request('screen')
        }
      } catch {
        // Not allowed here; the screen may dim.
      }
    }
    void acquire()
    document.addEventListener('visibilitychange', acquire)

    const wake = () => {
      setIdle(false)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setIdle(true), idleMs)
    }
    timer.current = setTimeout(() => setIdle(true), idleMs)
    const toggleFullscreen = () => {
      if (document.fullscreenElement) void document.exitFullscreen()
      else void document.documentElement.requestFullscreen().catch(() => {})
    }
    const onKey = (event: KeyboardEvent) => {
      wake()
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === 'f' || event.key === 'F') toggleFullscreen()
      if (event.key === 'r' || event.key === 'R') window.location.reload()
    }
    // Pointer events cover touch screens, where a tap sends no mousemove.
    window.addEventListener('pointermove', wake)
    window.addEventListener('pointerdown', wake)
    window.addEventListener('keydown', onKey)
    window.addEventListener('dblclick', toggleFullscreen)
    return () => {
      document.removeEventListener('visibilitychange', acquire)
      window.removeEventListener('pointermove', wake)
      window.removeEventListener('pointerdown', wake)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('dblclick', toggleFullscreen)
      clearTimeout(timer.current)
      void lock?.release().catch(() => {})
    }
  }, [idleMs])

  return idle
}
