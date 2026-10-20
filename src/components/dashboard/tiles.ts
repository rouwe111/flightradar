import { CATEGORY, MAX_TILES, SQUAWK } from '@/components/dashboard/constants'
import type { TileProps } from '@/components/dashboard/types'
import { NM_KM } from '@/lib/constants'
import { num } from '@/lib/format'
import { compass, ftToM } from '@/lib/geo'
import type { SkyPlane } from '@/lib/types'

export function tilesFor(target: SkyPlane): Array<TileProps> {
  const tiles: Array<TileProps | false | null> = [
    target.altFt != null && {
      label: 'Altitude',
      value: num(target.altFt),
      unit: 'ft',
      sub: `${num(ftToM(target.altFt))} m`,
    },
    target.gs != null && {
      label: 'Ground speed',
      value: num(target.gs * NM_KM),
      unit: 'km/h',
      sub: `${num(target.gs)} kt${target.mach ? `, Mach ${num(target.mach, 2)}` : ''}`,
    },
    target.baroRate != null && {
      label:
        Math.abs(target.baroRate) < 100
          ? 'Level flight'
          : target.baroRate > 0
            ? 'Climbing'
            : 'Descending',
      value: num(Math.abs(target.baroRate)),
      unit: 'ft/min',
      sub: `${num(Math.abs(target.baroRate) * 0.00508, 1)} m/s`,
    },
    target.track != null && {
      label: 'Heading',
      value: `${num(target.track)}°`,
      sub: `Flying ${compass(target.track)}`,
    },
    target.elev != null && {
      label: 'Height in your sky',
      value: `${num(target.elev, 1)}°`,
      sub: `Look ${compass(target.brg)}`,
    },
    {
      label: 'Distance from home',
      value: num(target.dKm, 1),
      unit: 'km',
      sub: `Bearing ${num(target.brg)}° ${compass(target.brg)}`,
    },
    target.squawk
      ? {
          label: 'Squawk',
          value: target.squawk,
          sub: SQUAWK[target.squawk] ?? 'Code from air traffic control',
        }
      : null,
    target.windSpeed != null && {
      label: 'Wind at altitude',
      value: num(target.windSpeed),
      unit: 'kt',
      sub:
        target.windDirection != null
          ? `From ${num(target.windDirection)}° ${compass(target.windDirection)}`
          : undefined,
    },
    target.outsideTemp != null && {
      label: 'Outside air',
      value: num(target.outsideTemp),
      unit: '°C',
    },
    target.navAltitude != null && {
      label: 'Autopilot altitude',
      value: num(target.navAltitude),
      unit: 'ft',
    },
    target.category
      ? {
          label: 'Aircraft class',
          value: target.category,
          sub: CATEGORY[target.category],
        }
      : null,
    target.seen != null && {
      label: 'Last signal',
      value: num(target.seen, 1),
      unit: 's ago',
      sub: `Hex ${target.hex.toUpperCase()}`,
    },
  ]
  return tiles.filter((tile): tile is TileProps => !!tile).slice(0, MAX_TILES)
}
