'use client'

import { OverheadDashboard } from '@/components/dashboard/dashboard'
import { OverheadLED } from '@/components/led/led-display'
import { ConfigContext } from '@/hooks/config-context'
import type { ClientConfig } from '@/lib/types'

/** The client side of the page: everything below here runs in the browser. */
export function Screen({
  config,
  view,
  radius,
  brightness,
  bloom,
}: {
  config: ClientConfig
  view: ClientConfig['view']
  radius: number
  brightness: number
  bloom: boolean
}) {
  return (
    <ConfigContext.Provider value={config}>
      {view === 'dashboard' ? (
        <OverheadDashboard radius={radius} />
      ) : (
        <OverheadLED radius={radius} brightness={brightness} bloom={bloom} />
      )}
    </ConfigContext.Provider>
  )
}
