import {
  AFTERGLOW,
  COL,
  MINI_RANGES_KM,
  SWEEP_MS,
} from '@/components/led/draw/constants'
import { line, rect, ring } from '@/components/led/draw/primitives'
import type { View } from '@/components/led/draw/types'
import { rad } from '@/lib/geo'
import type { SkyPlane } from '@/lib/types'

/*
 * A small radar: solid rim, faint crosshair and a sweep. Other aircraft
 * light up as the sweep passes and fade soon after, like a radar screen;
 * the tracked plane is always pink (the only pink here), with a dot ahead
 * of it for its heading. The house is the white dot in the middle. Not
 * shown while a flight from the admin is followed.
 */
export function miniRadarBase(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number,
) {
  line(ctx, cx - R + 1, cy, cx + R - 1, cy, COL.grid)
  line(ctx, cx, cy - R + 1, cx, cy + R - 1, COL.grid)
  ring(ctx, cx, cy, R, COL.ring, false)
  rect(ctx, cx, cy - R, 1, 1, COL.txt) // north
}

export function miniRadarSweep(
  ctx: CanvasRenderingContext2D,
  v: View,
  p: SkyPlane,
  cx: number,
  cy: number,
  R: number,
  t: number,
) {
  const sweep = ((t / SWEEP_MS) * Math.PI * 2) % (Math.PI * 2)
  for (let k = 5; k >= 0; k--) {
    const angle = sweep - k * 0.12
    ctx.globalAlpha = 0.85 - k * 0.15
    line(
      ctx,
      cx,
      cy,
      cx + Math.sin(angle) * (R - 1),
      cy - Math.cos(angle) * (R - 1),
      COL.dim,
    )
  }
  ctx.globalAlpha = 1

  const range = Math.min(
    MINI_RANGES_KM.find((km) => p.dKm <= km) ?? v.rangeKm,
    v.rangeKm,
  )
  const at = (plane: SkyPlane) => {
    const r = Math.min(plane.dKm / range, 1) * (R - 1)
    return {
      x: cx + Math.sin(rad(plane.brg)) * r,
      y: cy - Math.cos(rad(plane.brg)) * r,
    }
  }

  for (const plane of v.planes) {
    if (plane.hex === p.hex || plane.dKm > range) continue
    // Time since the sweep passed this bearing, as a share of one turn.
    const since =
      (((sweep - rad(plane.brg)) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    const glow = 1 - since / (Math.PI * 2) / AFTERGLOW
    if (glow <= 0.1) continue
    ctx.globalAlpha = glow
    const { x, y } = at(plane)
    rect(ctx, x, y, 1, 1, COL.txt)
  }
  ctx.globalAlpha = 1

  rect(ctx, cx, cy, 1, 1, COL.white)

  const { x, y } = at(p)
  if (p.track != null) {
    rect(
      ctx,
      x + Math.sin(rad(p.track)) * 3,
      y - Math.cos(rad(p.track)) * 3,
      1,
      1,
      COL.warm,
    )
  }
  rect(ctx, x, y, 1, 1, COL.pink)
}
