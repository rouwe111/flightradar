import { COL, EMPTY_RADAR } from '@/components/led/draw/constants'
import { fit } from '@/components/led/draw/font'
import { drawText, line, rect, ring } from '@/components/led/draw/primitives'
import type { View } from '@/components/led/draw/types'
import { num } from '@/lib/format'

export function pageEmpty(ctx: CanvasRenderingContext2D, v: View) {
  const { cx, cy, R } = EMPTY_RADAR
  ;[R, Math.round(R * 0.66), Math.round(R * 0.33)].forEach((r) =>
    ring(ctx, cx, cy, r, COL.grid),
  )
  line(ctx, cx - R, cy, cx + R, cy, COL.grid)
  line(ctx, cx, cy - R, cx, cy + R, COL.grid)
  drawText(ctx, 'N', cx, 1, COL.txt, 1, 'center')

  const sub =
    v.status === 'error'
      ? ['No answer from feed', 'Retrying shortly']
      : v.followed && v.status === 'ok'
        ? v.followed.checked
          ? ['Not in the air', `Checking every ${v.pollSeconds}s`]
          : ['Looking up', v.followed.number]
        : v.status === 'loading'
          ? ['Waiting for', 'flight data']
          : ['No flights', `within ${num(v.rangeKm)}km`]
  sub.forEach((s, i) => drawText(ctx, fit(s, 82), 108, 51 + i * 9, COL.dim))
}

/* The sweep, and the title with its "Scanning..." dots. */
export function emptyMoving(ctx: CanvasRenderingContext2D, v: View, t: number) {
  const { cx, cy, R } = EMPTY_RADAR
  const a = ((t / 8000) * Math.PI * 2) % (Math.PI * 2)
  for (let k = 6; k >= 0; k--) {
    const ang = a - k * 0.06
    ctx.globalAlpha = 0.9 - k * 0.13
    line(ctx, cx, cy, cx + Math.sin(ang) * R, cy - Math.cos(ang) * R, COL.pink)
  }
  ctx.globalAlpha = 1

  rect(ctx, cx - 1, cy, 3, 1, COL.white)
  rect(ctx, cx, cy - 1, 1, 3, COL.white)

  const dots = '.'.repeat(1 + (Math.floor(t / 400) % 3))
  const followed = v.status === 'ok' ? v.followed : null
  const title =
    v.status === 'error'
      ? 'Feed offline'
      : v.status === 'loading' || (followed && !followed.checked)
        ? `Scanning${dots}`
        : followed
          ? followed.number
          : 'Clear skies'
  drawText(ctx, title, 108, 40, COL.txt)
}
