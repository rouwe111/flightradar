import { isPreferredFlight } from '@/lib/plane-filter'
import type { SkyPayload } from '@/lib/types'
import { getConfig } from '@/server/config'
import { resolveCallsign } from '@/server/callsign'
import { toPlanes } from '@/server/parse'
import { withRoutes } from '@/server/routes'
import type { Cached } from '@/server/types'
import { adsb } from '@/server/upstream'

/** Uses the area answer when the flight is near the house: one request less. */
async function findFlight(flightNumber: string, around: Cached | null) {
  const callsign = await resolveCallsign(flightNumber)
  const nearby = around
    ? toPlanes(around.list).find((plane) => plane.callsign === callsign)
    : undefined
  if (nearby)
    return { number: flightNumber, callsign, plane: nearby, checked: true }
  const answer = await adsb(
    `/v2/callsign/${encodeURIComponent(callsign)}`,
    getConfig().flightCacheMs,
  )
  const plane = answer ? (toPlanes(answer.list).at(0) ?? null) : null
  return { number: flightNumber, callsign, plane, checked: answer !== null }
}

export async function loadSky(radiusNm: number): Promise<SkyPayload> {
  const { latitude, longitude, flightNumber } = getConfig()
  const path = `/v2/point/${latitude.toFixed(4)}/${longitude.toFixed(4)}/${radiusNm}`
  const around = await adsb(path)
  const flight = flightNumber ? await findFlight(flightNumber, around) : null
  if (!around && !flight?.checked) {
    throw new Error('Flight feed unreachable.')
  }
  // By default private and light aircraft never reach the screens (the
  // followed flight always does). Filtering first also keeps them out of the
  // route lookup.
  const all = around ? toPlanes(around.list) : []
  const area =
    getConfig().aircraftFilter === 'airline'
      ? all.filter(isPreferredFlight)
      : all
  const routed = await withRoutes(
    flight?.plane ? [...area, flight.plane] : area,
  )
  return {
    flight: flight && {
      ...flight,
      plane: flight.plane ? (routed.at(area.length) ?? flight.plane) : null,
    },
    planes: routed.slice(0, area.length),
    updatedAt: around?.at ?? Date.now(),
  }
}
