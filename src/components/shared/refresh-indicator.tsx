import { useEffect, useState } from 'react'
import { MIN_VISIBLE_MS } from '@/components/shared/constants'
import type { ScreenVariant } from '@/components/shared/types'
import '@/components/shared/refresh-indicator.css'

/**
 * A small pink dot in the top right corner while the screen checks for new
 * positions. A check that answers from the server cache takes a few
 * milliseconds, so the dot stays at least MIN_VISIBLE_MS to be noticed.
 */
export function RefreshIndicator({
  active,
  variant,
}: {
  active: boolean
  variant: ScreenVariant
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (active) {
      setVisible(true)
      return
    }
    const timer = setTimeout(() => setVisible(false), MIN_VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [active])

  return (
    <div
      className={`fr-refresh fr-refresh-${variant} ${visible ? 'is-visible' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="fr-refresh-dot" aria-hidden="true" />
      <span className="fr-refresh-label">
        {visible ? 'Checking for new positions' : ''}
      </span>
    </div>
  )
}
