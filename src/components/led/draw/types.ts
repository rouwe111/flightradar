import type { Sky } from '@/hooks/types'
import type { Aircraft, FlightRoute, SkyPlane } from '@/lib/types'

export type View = {
  status: Sky['status']
  target: SkyPlane | null
  /** Everything around the house, for the mini radar. */
  planes: Array<SkyPlane>
  aircraft: Aircraft | null
  route: FlightRoute | null
  done: boolean
  logo: HTMLImageElement | null
  rangeKm: number
  /** The saved flight, while one is set. Then only that flight is shown. */
  followed: { number: string; checked: boolean } | null
  pollSeconds: number
}

export type Glyph = { r0: number; rows: Array<string>; w: number }

export type Sharp = {
  img: HTMLImageElement
  x: number
  y: number
  w: number
  h: number
  bg: string
  pad: number
}
