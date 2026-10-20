import { W } from '@/components/led/draw/constants'
import { drawImageBox } from '@/components/led/draw/primitives'
import type { Sharp } from '@/components/led/draw/types'

/* The airline logo skips the LED grid: it is queued here and drawn sharp on a
   full-resolution layer above the dots (see drawSharp). */
const queue: Array<Sharp> = []

export function resetSharp() {
  queue.length = 0
}

export function queueSharp(item: Sharp) {
  queue.push(item)
}

export function drawSharp(ctx: CanvasRenderingContext2D) {
  const k = ctx.canvas.width / W
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  if (!queue.length) return
  ctx.setTransform(k, 0, 0, k, 0, 0)
  for (const s of queue) {
    ctx.fillStyle = s.bg
    ctx.fillRect(s.x, s.y, s.w, s.h)
    drawImageBox(
      ctx,
      s.img,
      s.x + s.pad,
      s.y + s.pad,
      s.w - 2 * s.pad,
      s.h - 2 * s.pad,
    )
  }
}
