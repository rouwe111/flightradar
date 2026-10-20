import { useEffect, useState } from 'react'
import type { Viewport } from '@/hooks/types'

/**
 * The visible screen size and pixel ratio, null until mounted (the server
 * can't know it, so CSS sizes the screen until then). Re-read when toolbars
 * come and go and on fullscreen changes.
 */
export function useViewport() {
  const [viewport, setViewport] = useState<Viewport | null>(null)
  useEffect(() => {
    const read = () =>
      setViewport({
        w: Math.min(
          window.innerWidth,
          window.visualViewport?.width ?? window.innerWidth,
        ),
        h: Math.min(
          window.innerHeight,
          window.visualViewport?.height ?? window.innerHeight,
        ),
        dpr: window.devicePixelRatio || 1,
      })
    read()
    window.addEventListener('resize', read)
    window.visualViewport?.addEventListener('resize', read)
    document.addEventListener('fullscreenchange', read)
    return () => {
      window.removeEventListener('resize', read)
      window.visualViewport?.removeEventListener('resize', read)
      document.removeEventListener('fullscreenchange', read)
    }
  }, [])
  return viewport
}
