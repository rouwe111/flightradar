import { COL, MINI_RADAR, SQUAWK } from '@/components/led/draw/constants'
import { fit, clean, textWidth } from '@/components/led/draw/font'
import { miniRadarBase, miniRadarSweep } from '@/components/led/draw/mini-radar'
import { drawText, rect } from '@/components/led/draw/primitives'
import { queueSharp } from '@/components/led/draw/sharp-layer'
import type { View } from '@/components/led/draw/types'
import { NM_KM } from '@/lib/constants'
import { clamp, compass, distKm } from '@/lib/geo'
import { num } from '@/lib/format'
import type { SkyPlane } from '@/lib/types'

function drawLogo(
  ctx: CanvasRenderingContext2D,
  v: View,
  p: SkyPlane,
  x: number,
  y: number,
  s: number,
) {
  const airline = v.route?.airline
  if (v.logo) {
    queueSharp({ img: v.logo, x, y, w: s, h: s, bg: COL.white, pad: 3 })
    return
  }
  rect(ctx, x, y, s, s, COL.pink)
  const code = clean(
    airline?.iata || airline?.icao || p.callsign.slice(0, 3) || '?',
  )
  const sc = textWidth(code, 3) <= s - 4 ? 3 : 2
  drawText(
    ctx,
    code,
    x + s / 2,
    y + Math.round((s - 7 * sc) / 2),
    COL.white,
    sc,
    'center',
  )
}

export function pageFlight(
  ctx: CanvasRenderingContext2D,
  v: View,
  p: SkyPlane,
) {
  const ac = v.aircraft
  const rt = v.route
  drawLogo(ctx, v, p, 2, 2, 40)

  const X = 47
  drawText(
    ctx,
    fit(p.callsign || p.hex.toUpperCase(), 143, 3),
    X,
    2,
    COL.txt,
    3,
  )

  // An emergency squawk blinks in this line; see flightMoving.
  if (!emergencyOf(p)) {
    const operator =
      rt?.airline?.name ||
      ac?.registered_owner ||
      (v.done ? 'Operator unknown' : 'Looking up the flight')
    drawText(ctx, fit(operator, 143), X, 26, COL.warm)
  }

  const reg = clean(ac?.registration || p.registration || '')
  const type = clean(
    ac ? `${ac.manufacturer ?? ''} ${ac.type ?? ''}` : p.typeCode || '',
  )
  const regW = reg ? textWidth(reg) + 6 : 0
  drawText(ctx, fit(type, 143 - regW), X, 36, COL.dim)
  if (reg) drawText(ctx, reg, 189, 36, COL.txt, 1, 'right')

  /* route */
  // Route block; the rows under it are spaced so the city names (with their
  // descenders) keep a few empty rows above the figures.
  const ry = 47
  const o = rt?.origin
  const d = rt?.destination
  if (o && d) {
    const oc = clean(o.iata_code || o.icao_code || '?')
    const dc = clean(d.iata_code || d.icao_code || '?')
    drawText(ctx, oc, 3, ry, COL.txt, 3)
    drawText(ctx, dc, 189, ry, COL.txt, 3, 'right')

    const x0 = 3 + textWidth(oc, 3) + 6
    const x1 = 189 - textWidth(dc, 3) - 6
    const flown = distKm(o.latitude, o.longitude, p.lat, p.lon)
    const left = distKm(p.lat, p.lon, d.latitude, d.longitude)
    const pct = clamp(flown / (flown + left || 1), 0, 1)
    const ly = ry + 11
    for (let x = x0; x <= x1; x += 2) rect(ctx, x, ly, 1, 1, COL.dim)
    rect(ctx, x0, ly, Math.round((x1 - x0) * pct), 1, COL.pink)
    drawText(ctx, '→', x0 + Math.round((x1 - x0) * pct) - 3, ly - 3, COL.pink)

    const mid = (x0 + x1) / 2
    drawText(ctx, `${num(left)}km`, mid, ry, COL.warm, 1, 'center')
    if (p.gs) {
      const h = left / (p.gs * NM_KM)
      const eta =
        h >= 1
          ? `${Math.floor(h)}h ${Math.round((h % 1) * 60)}m`
          : `${Math.round(h * 60)}m`
      drawText(ctx, eta, mid, ry + 15, COL.dim, 1, 'center')
    }
    drawText(ctx, fit(o.municipality || o.name || '', 92), 3, ry + 23, COL.warm)
    drawText(
      ctx,
      fit(d.municipality || d.name || '', 92),
      189,
      ry + 23,
      COL.warm,
      1,
      'right',
    )
  } else {
    drawText(
      ctx,
      v.done ? 'Route unknown' : 'Looking up route',
      96,
      ry + 3,
      COL.dim,
      2,
      'center',
    )
    if (v.done) {
      drawText(
        ctx,
        fit('Often none for private or military', 188),
        96,
        ry + 23,
        COL.dim,
        1,
        'center',
      )
    }
  }

  /* telemetry */
  const vs = p.baroRate
  const rows: Array<Array<[string, string]>> = [
    [
      ['Alt', p.altFt != null ? `${num(p.altFt)}ft` : '-'],
      ['Spd', p.gs != null ? `${num(p.gs * NM_KM)}km/h` : '-'],
    ],
    [
      ['Hdg', p.track != null ? `${num(p.track)}° ${compass(p.track)}` : '-'],
      [
        'VS',
        vs == null
          ? '-'
          : Math.abs(vs) < 100
            ? 'Level'
            : `${vs > 0 ? '^' : '~'}${num(Math.abs(vs))}ft/m`,
      ],
    ],
    [
      ['Dist', `${num(p.dKm, 1)}km`],
      ['Elev', p.elev != null ? `${num(p.elev)}°` : '-'],
    ],
  ]
  // Two tight columns (widest values end at 69 and 153) leave the bottom
  // right corner for the mini radar.
  rows.forEach((r, i) =>
    r.forEach(([lab, val], j) => {
      const x = j ? 76 : 3
      const y = 82 + i * 9
      drawText(ctx, lab, x, y, COL.dim)
      drawText(ctx, val, x + 23, y, COL.txt)
    }),
  )

  // A flight followed from the admin can be anywhere, so the radar around
  // the house says nothing about it.
  if (!v.followed) miniRadarBase(ctx, ...MINI_RADAR)
}

export const emergencyOf = (p: SkyPlane) =>
  p.squawk ? SQUAWK[p.squawk] : undefined

/* The parts of the flight page that move: the emergency blink and the
   mini radar's sweep and dots. */
export function flightMoving(
  ctx: CanvasRenderingContext2D,
  v: View,
  p: SkyPlane,
  t: number,
) {
  const emergency = emergencyOf(p)
  if (emergency && Math.floor(t / 500) % 2 === 0) {
    drawText(ctx, `SQUAWK ${p.squawk} ${emergency}`, 47, 26, COL.pink)
  }
  if (!v.followed) miniRadarSweep(ctx, v, p, ...MINI_RADAR, t)
}
