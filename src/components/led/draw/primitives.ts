import { clean, glyph, textWidth } from '@/components/led/draw/font'

export function rect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h))
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  input: string,
  startX: number,
  y: number,
  color: string,
  s = 1,
  align: 'left' | 'right' | 'center' = 'left',
) {
  const str = clean(input)
  const w = textWidth(str, s)
  let x = startX
  if (align === 'right') x -= w
  else if (align === 'center') x -= Math.floor(w / 2)
  x = Math.round(x)
  ctx.fillStyle = color
  for (const ch of str) {
    const g = glyph(ch)
    for (let r = 0; r < g.rows.length; r++) {
      const row = g.rows[r] ?? ''
      for (let c = 0; c < g.w; c++) {
        if (row[c] === '#') ctx.fillRect(x + c * s, y + (g.r0 + r) * s, s, s)
      }
    }
    x += (g.w + 1) * s
  }
}

export function line(
  ctx: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
) {
  ctx.fillStyle = color
  let x0 = Math.round(fromX)
  let y0 = Math.round(fromY)
  const x1 = Math.round(toX)
  const y1 = Math.round(toY)
  const dx = Math.abs(x1 - x0)
  const dy = -Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx + dy
  for (let i = 0; i < 400; i++) {
    ctx.fillRect(x0, y0, 1, 1)
    if (x0 === x1 && y0 === y1) break
    const e2 = 2 * err
    if (e2 >= dy) {
      err += dy
      x0 += sx
    }
    if (e2 <= dx) {
      err += dx
      y0 += sy
    }
  }
}

export function ring(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  color: string,
  dotted = true,
) {
  ctx.fillStyle = color
  let x = r
  let y = 0
  let err = 1 - r
  const plot = (px: number, py: number) => {
    if (!dotted || (px + py) % 2 === 0) ctx.fillRect(cx + px, cy + py, 1, 1)
  }
  while (x >= y) {
    plot(x, y)
    plot(y, x)
    plot(-y, x)
    plot(-x, y)
    plot(-x, -y)
    plot(-y, -x)
    plot(y, -x)
    plot(x, -y)
    y++
    if (err < 0) err += 2 * y + 1
    else {
      x--
      err += 2 * (y - x) + 1
    }
  }
}

export function drawImageBox(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  if (!iw || !ih) return
  const k = Math.min(w / iw, h / ih)
  const dw = Math.round(iw * k)
  const dh = Math.round(ih * k)
  ctx.drawImage(
    img,
    x + Math.round((w - dw) / 2),
    y + Math.round((h - dh) / 2),
    dw,
    dh,
  )
}
