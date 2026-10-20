import type { Airport, Plane } from '@/lib/types'
import type { RawAircraft, RouteAirport } from '@/server/types'

export const numberOrNull = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null
export const textOrNull = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : null

export function toPlane(raw: RawAircraft): Plane | null {
  const hex = textOrNull(raw.hex)
  const lat = numberOrNull(raw.lat)
  const lon = numberOrNull(raw.lon)
  if (!hex || lat === null || lon === null) return null
  const altFt =
    raw.alt_baro === 'ground'
      ? 0
      : (numberOrNull(raw.alt_baro) ?? numberOrNull(raw.alt_geom))
  return {
    hex,
    callsign: textOrNull(raw.flight) ?? '',
    lat,
    lon,
    altFt,
    gs: numberOrNull(raw.gs),
    track: numberOrNull(raw.track),
    baroRate: numberOrNull(raw.baro_rate) ?? numberOrNull(raw.geom_rate),
    squawk: textOrNull(raw.squawk),
    registration: textOrNull(raw.r),
    typeCode: textOrNull(raw.t),
    mach: numberOrNull(raw.mach),
    windSpeed: numberOrNull(raw.ws),
    windDirection: numberOrNull(raw.wd),
    outsideTemp: numberOrNull(raw.oat),
    navAltitude: numberOrNull(raw.nav_altitude_mcp),
    category: textOrNull(raw.category),
    seen: numberOrNull(raw.seen),
    route: null,
    // readsb's dbFlags: bit 0 is military.
    military: ((numberOrNull(raw.dbFlags) ?? 0) & 1) === 1,
  }
}

export function toAirport(raw: RouteAirport | undefined): Airport | null {
  const latitude = numberOrNull(raw?.lat)
  const longitude = numberOrNull(raw?.lon)
  if (!raw || latitude === null || longitude === null) return null
  return {
    iata_code: textOrNull(raw.iata) ?? undefined,
    icao_code: textOrNull(raw.icao) ?? undefined,
    latitude,
    longitude,
    municipality: textOrNull(raw.location) ?? undefined,
    name: textOrNull(raw.name) ?? undefined,
    country_iso_name: textOrNull(raw.countryiso2) ?? undefined,
  }
}

// Each upstream answer is parsed once, however many screens poll it.
const parsedLists = new WeakMap<RawAircraft[], Array<Plane>>()
export function toPlanes(list: RawAircraft[]) {
  let planes = parsedLists.get(list)
  if (!planes) {
    planes = list.map(toPlane).filter((item): item is Plane => item !== null)
    parsedLists.set(list, planes)
  }
  return planes
}
