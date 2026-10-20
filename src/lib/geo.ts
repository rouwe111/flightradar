import { COMPASS_POINTS } from '@/lib/constants'
import type { Plane, SkyPlane } from '@/lib/types'

export const rad = (d: number) => (d * Math.PI) / 180
export const deg = (r: number) => (r * 180) / Math.PI
export const ftToM = (ft: number) => ft * 0.3048

export function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function distKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const dLat = rad(lat2 - lat1)
  const dLon = rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(a))
}

export function bearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const dLon = rad(lon2 - lon1)
  const y = Math.sin(dLon) * Math.cos(rad(lat2))
  const x =
    Math.cos(rad(lat1)) * Math.sin(rad(lat2)) -
    Math.sin(rad(lat1)) * Math.cos(rad(lat2)) * Math.cos(dLon)
  return (deg(Math.atan2(y, x)) + 360) % 360
}

export const compass = (b: number) =>
  COMPASS_POINTS[Math.round(b / 22.5) % 16] ?? 'N'

export function decorate(
  plane: Plane,
  home: { latitude: number; longitude: number },
): SkyPlane {
  const dKm = distKm(home.latitude, home.longitude, plane.lat, plane.lon)
  const brg = bearing(home.latitude, home.longitude, plane.lat, plane.lon)
  const elev =
    plane.altFt == null ? null : deg(Math.atan2(ftToM(plane.altFt), dKm * 1000))
  return { ...plane, dKm, brg, elev }
}
