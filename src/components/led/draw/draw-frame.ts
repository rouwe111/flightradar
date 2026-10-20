import { COL, H, W } from '@/components/led/draw/constants'
import { emptyMoving, pageEmpty } from '@/components/led/draw/empty-page'
import {
  emergencyOf,
  flightMoving,
  pageFlight,
} from '@/components/led/draw/flight-page'
import { resetSharp } from '@/components/led/draw/sharp-layer'
import type { View } from '@/components/led/draw/types'

/*
 * The still layer: everything that only changes with new data. Drawn once
 * per change onto an off-screen canvas; the glow and the sharp logo layer
 * are updated from it at the same moment, never per frame.
 */
export function drawStill(ctx: CanvasRenderingContext2D, v: View) {
  resetSharp()
  ctx.fillStyle = COL.black
  ctx.fillRect(0, 0, W, H)
  if (!v.target) pageEmpty(ctx, v)
  else pageFlight(ctx, v, v.target)
}

/* Whether anything moves; otherwise nothing is redrawn between changes. */
export function isMoving(v: View) {
  return !v.target || !v.followed || !!emergencyOf(v.target)
}

export function drawMoving(ctx: CanvasRenderingContext2D, v: View, t: number) {
  if (!v.target) emptyMoving(ctx, v, t)
  else flightMoving(ctx, v, v.target, t)
}
