import { useMemo } from 'react'
import { useConfig } from '@/hooks/config-context'
import { useLookup } from '@/hooks/use-lookup'
import { fetchJson } from '@/lib/fetch-json'
import type { Aircraft, Airline, FlightRoute, Plane } from '@/lib/types'

/**
 * Aircraft details and airline from adsbdb. adsbdb's route table is stale for
 * reused callsigns, so the route itself comes with the plane from the server.
 */
export function useEnrichment(plane: Plane | null) {
  const { adsbdbUrl } = useConfig()
  const hex = plane?.hex
  const callsign = plane?.callsign
  const aircraft = useLookup<Aircraft>(hex ? `aircraft:${hex}` : null, () =>
    fetchJson<{ response?: { aircraft?: Aircraft } }>(
      `${adsbdbUrl}/v0/aircraft/${hex}`,
    ).then((json) => json?.response?.aircraft ?? null),
  )
  const airline = useLookup<Airline>(
    callsign ? `callsign:${callsign}` : null,
    () =>
      fetchJson<{ response?: { flightroute?: { airline?: Airline | null } } }>(
        `${adsbdbUrl}/v0/callsign/${encodeURIComponent(callsign ?? '')}`,
      ).then((json) => json?.response?.flightroute?.airline ?? null),
  )
  const planeRoute = plane?.route
  const route = useMemo<FlightRoute | null>(
    () =>
      airline.data || planeRoute
        ? {
            airline: airline.data ?? null,
            origin: planeRoute?.origin,
            destination: planeRoute?.destination,
          }
        : null,
    [airline.data, planeRoute],
  )
  return {
    aircraft: aircraft.data,
    route,
    done: !aircraft.loading && !airline.loading,
  }
}
