import type { CSSProperties, RefObject } from 'react'
import { H, W } from '@/components/led/draw/constants'

type Props = {
  /** Screen pixels per LED, or null until the screen is measured. */
  pitch: number | null
  brightness: number
  bloom: boolean
  /** Resolution of the sharp (airline logo) layer, per LED. */
  sharpScale: number
  canvasRef: RefObject<HTMLCanvasElement | null>
  bloomRef: RefObject<HTMLCanvasElement | null>
  sharpRef: RefObject<HTMLCanvasElement | null>
}

/** The LED panel: the dots, the round-LED mask, the glow and the logo layer. */
export function LedPanel({
  pitch,
  brightness,
  bloom,
  sharpScale,
  canvasRef,
  bloomRef,
  sharpRef,
}: Props) {
  const style: CSSProperties & { '--led'?: string } = {
    ...(pitch ? { '--led': `${pitch}px` } : {}),
    // Any filter, even brightness(1), makes the browser render the whole
    // panel into an extra layer; only set one when dimmed.
    ...(brightness < 1 ? { filter: `brightness(${brightness})` } : {}),
  }
  return (
    <div className="led-panel" style={style}>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="led-canvas"
        aria-label="Aircraft currently overhead"
      />
      <div className="led-mask" aria-hidden="true" />
      {bloom && (
        <canvas
          ref={bloomRef}
          width={W}
          height={H}
          className="led-bloom"
          aria-hidden="true"
        />
      )}
      <canvas
        ref={sharpRef}
        width={Math.round(W * sharpScale)}
        height={Math.round(H * sharpScale)}
        className="led-sharp"
        aria-hidden="true"
      />
    </div>
  )
}
