import { useEffect, useRef } from 'react'
import type { RefObject } from 'react'
import { H, W } from '@/components/led/draw/constants'
import {
  drawMoving,
  drawStill,
  isMoving,
} from '@/components/led/draw/draw-frame'
import { drawSharp } from '@/components/led/draw/sharp-layer'
import type { View } from '@/components/led/draw/types'
import { useConfig } from '@/hooks/config-context'

/**
 * Runs the draw loop. The still layer is drawn once per change onto an
 * off-screen canvas; each frame only copies it and draws the moving parts, and
 * nothing at all when nothing moves. Returns the refs for the panel's canvases.
 */
export function useLedRenderer(view: RefObject<View>, bloom: boolean) {
  const { ledFps } = useConfig()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bloomRef = useRef<HTMLCanvasElement>(null)
  const sharpRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d', { alpha: false })
    const sctx = sharpRef.current?.getContext('2d')
    const still = document.createElement('canvas')
    still.width = W
    still.height = H
    const stillCtx = still.getContext('2d', { alpha: false })
    if (!ctx || !sctx || !stillCtx) return
    sctx.imageSmoothingQuality = 'high'
    const bctx = bloomRef.current?.getContext('2d')
    const frameMs = 1000 / ledFps
    const t0 = performance.now()
    let raf = 0
    let last = 0
    let drawn: View | null = null
    const frame = (ts: number) => {
      raf = requestAnimationFrame(frame)
      const v = view.current
      const changed = v !== drawn
      if (!changed && (!isMoving(v) || ts - last < frameMs)) return
      last = ts
      if (changed) {
        drawn = v
        drawStill(stillCtx, v)
        if (bctx) {
          bctx.clearRect(0, 0, W, H)
          bctx.drawImage(still, 0, 0)
        }
        drawSharp(sctx)
      }
      ctx.drawImage(still, 0, 0)
      if (isMoving(v)) drawMoving(ctx, v, ts - t0)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [view, bloom, ledFps])

  return { canvasRef, bloomRef, sharpRef }
}
