import { useEffect, useMemo, useRef } from 'react'
import type { View } from '@/components/led/draw/types'
import { logoUrls } from '@/components/led/logo-urls'
import { useConfig } from '@/hooks/config-context'
import type { Sky } from '@/hooks/types'
import { useEnrichment } from '@/hooks/use-enrichment'
import { useImageChain } from '@/hooks/use-image-chain'
import { NM_KM } from '@/lib/constants'
import type { SkyPlane } from '@/lib/types'

/**
 * What the draw loop shows, kept in a ref. A new view object is the loop's
 * signal to redraw the still layer, so one is only made when something on
 * screen changes. `sharpScale` is a dependency because the logo layer has to
 * be redrawn when its resolution changes.
 */
export function useLedView(sky: Sky, radius: number, sharpScale: number) {
  const { pollMs } = useConfig()
  const pollSeconds = Math.round(pollMs / 1000)

  // While a flight is saved only that flight is shown, never a stand-in;
  // otherwise the closest (the server already left out private planes).
  const closest = useMemo(
    () =>
      sky.planes.reduce<SkyPlane | null>(
        (best, plane) => (!best || plane.dKm < best.dKm ? plane : best),
        null,
      ),
    [sky.planes],
  )
  const target = sky.flight ? sky.flight.plane : closest
  const { aircraft, route, done } = useEnrichment(target)
  const logo = useImageChain(logoUrls(route?.airline?.iata))
  const followed = sky.flight

  const view = useRef<View>({
    status: 'loading',
    target: null,
    planes: [],
    aircraft: null,
    route: null,
    done: false,
    logo: null,
    rangeKm: radius * NM_KM,
    followed: null,
    pollSeconds,
  })

  useEffect(() => {
    view.current = {
      status: sky.status,
      target,
      planes: sky.planes,
      aircraft,
      route,
      done,
      logo,
      rangeKm: radius * NM_KM,
      followed: followed
        ? { number: followed.number, checked: followed.checked }
        : null,
      pollSeconds,
    }
  }, [
    sky.status,
    target,
    sky.planes,
    aircraft,
    route,
    done,
    logo,
    radius,
    followed,
    pollSeconds,
    sharpScale,
  ])

  return view
}
