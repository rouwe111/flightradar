import { FONT_SRC } from '@/components/led/draw/font-data'
import type { Glyph } from '@/components/led/draw/types'

const FONT = new Map<string, Glyph>()
for (const [ch, src] of Object.entries(FONT_SRC)) {
  const [r0 = '0', rows = ''] = src.split('|')
  const rs = rows.split(' ')
  FONT.set(ch, { r0: +r0, rows: rs, w: rs[0]?.length ?? 0 })
}
const UNKNOWN: Glyph = FONT.get('?') ?? { r0: 0, rows: ['#'], w: 1 }

export function clean(s: string | null | undefined) {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‐-―]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export const glyph = (ch: string): Glyph => FONT.get(ch) ?? UNKNOWN

export function textWidth(str: string, s = 1) {
  let w = 0
  for (const ch of str) w += (glyph(ch).w + 1) * s
  return Math.max(0, w - s)
}

export function fit(input: string, maxW: number, s = 1) {
  let str = clean(input)
  if (textWidth(str, s) <= maxW) return str
  while (str.length > 1 && textWidth(str + '..', s) > maxW)
    str = str.slice(0, -1)
  return str.trimEnd() + '..'
}
