import type { Plane, PlaneRoute } from '@/lib/types'
import { fromCache, toCache } from '@/server/cache'
import { getConfig } from '@/server/config'
import { ROUTE_BATCH } from '@/server/constants'
import { textOrNull, toAirport } from '@/server/parse'
import type { RouteAirport } from '@/server/types'

async function fetchRoutes(planes: Array<Plane>) {
  const response = await fetch(getConfig().routesUrl, {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'user-agent': getConfig().userAgent,
    },
    body: JSON.stringify({
      planes: planes.map((plane) => ({
        callsign: plane.callsign,
        lat: plane.lat,
        lng: plane.lon,
      })),
    }),
    signal: AbortSignal.timeout(6_000),
  })
  if (!response.ok) throw new Error(`adsb.im answered ${response.status}`)
  const json = (await response.json()) as unknown
  const found = new Map<string, PlaneRoute | null>()
  if (!Array.isArray(json)) return found
  for (const item of json as Array<Record<string, unknown>>) {
    const callsign = textOrNull(item.callsign)
    if (!callsign) continue
    const airports = Array.isArray(item._airports)
      ? (item._airports as Array<RouteAirport>)
      : []
    // Multi-leg routes list every stop; the screens show first and last.
    const origin = toAirport(airports.at(0))
    const destination = toAirport(airports.at(-1))
    found.set(
      callsign,
      item.plausible === true && origin && destination && airports.length > 1
        ? { origin, destination }
        : null,
    )
  }
  return found
}

/** Adds routes to planes, from cache or one batched lookup. */
export async function withRoutes(planes: Array<Plane>): Promise<Array<Plane>> {
  const cached = (plane: Plane) =>
    fromCache<{ route: PlaneRoute | null }>(`route:${plane.callsign}`)
  const missing = planes
    .filter((plane) => plane.callsign && !cached(plane))
    .slice(0, ROUTE_BATCH)
  if (missing.length) {
    try {
      const found = await fetchRoutes(missing)
      for (const plane of missing) {
        // Callsigns adsb.im doesn't know are remembered as unknown too.
        toCache(
          `route:${plane.callsign}`,
          { route: found.get(plane.callsign) ?? null },
          getConfig().routeCacheMs,
        )
      }
    } catch {
      // adsb.im down: no routes this round, asked again next poll.
    }
  }
  return planes.map((plane) => ({
    ...plane,
    route: plane.callsign ? (cached(plane)?.route ?? null) : null,
  }))
}
