import { useMemo, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { EmptyCard } from '@/components/dashboard/empty-card'
import { HeroCard } from '@/components/dashboard/hero-card'
import { RadarCard } from '@/components/dashboard/radar-card'
import { RouteCard } from '@/components/dashboard/route-card'
import { TilesGrid } from '@/components/dashboard/tiles-grid'
import { tilesFor } from '@/components/dashboard/tiles'
import { RefreshIndicator } from '@/components/shared/refresh-indicator'
import { ReloadButton } from '@/components/shared/reload-button'
import { useConfig } from '@/hooks/config-context'
import { useEnrichment } from '@/hooks/use-enrichment'
import { useKiosk } from '@/hooks/use-kiosk'
import { useSky } from '@/hooks/use-sky'
import { NM_KM } from '@/lib/constants'
import '@/components/dashboard/dashboard.css'

/* All sizes in dashboard.css derive from --u so the layout fills any screen
   without scrolling, from a laptop to a 4K display. */
export function OverheadDashboard({ radius }: { radius: number }) {
  const { pollMs, airlineOnly } = useConfig()
  const sky = useSky(radius)
  const idle = useKiosk()
  const [pinned, setPinned] = useState<string | null>(null)
  const rangeKm = radius * NM_KM

  // Highest in the sky first, then closest. The server already left out
  // private planes.
  const planes = useMemo(
    () =>
      [...sky.planes].sort(
        (a, b) => (b.elev ?? -1) - (a.elev ?? -1) || a.dKm - b.dKm,
      ),
    [sky.planes],
  )
  // While a flight is saved only that flight is shown, never a stand-in;
  // otherwise a tapped aircraft, then the highest one overhead. A pinned
  // aircraft that left the feed simply stops matching.
  const target = sky.flight
    ? sky.flight.plane
    : (planes.find((p) => p.hex === pinned) ?? planes.at(0) ?? null)
  const { aircraft, route, done } = useEnrichment(target)

  return (
    <div className={`ov-root ${idle ? 'is-idle' : ''}`}>
      <RefreshIndicator active={sky.fetching} variant="light" />
      <ReloadButton visible={!idle} variant="light" />

      <DashboardHeader
        flight={sky.flight}
        status={sky.status}
        planeCount={planes.length}
        rangeKm={rangeKm}
        updatedAt={sky.updatedAt}
        timezone={sky.home.timezone}
      />

      {!target ? (
        <EmptyCard
          flight={sky.flight}
          status={sky.status}
          rangeKm={rangeKm}
          pollMs={pollMs}
          airlineOnly={airlineOnly}
        />
      ) : (
        <main className="ov-main">
          <div className="ov-col">
            <HeroCard
              target={target}
              route={route}
              aircraft={aircraft}
              done={done}
            />
            <RouteCard route={route} plane={target} />
          </div>
          <RadarCard
            planes={planes}
            rangeKm={rangeKm}
            targetHex={target.hex}
            onSelect={setPinned}
          />
          <TilesGrid tiles={tilesFor(target)} />
        </main>
      )}
    </div>
  )
}
