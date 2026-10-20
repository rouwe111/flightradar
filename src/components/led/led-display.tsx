import { H, W } from '@/components/led/draw/constants'
import { LedPanel } from '@/components/led/led-panel'
import { useLedRenderer } from '@/components/led/use-led-renderer'
import { useLedView } from '@/components/led/use-led-view'
import { RefreshIndicator } from '@/components/shared/refresh-indicator'
import { ReloadButton } from '@/components/shared/reload-button'
import { useKiosk } from '@/hooks/use-kiosk'
import { useSky } from '@/hooks/use-sky'
import { useViewport } from '@/hooks/use-viewport'
import '@/components/led/led.css'

/* ------------------------------------------------------------------ */
/*  LED matrix flight display                                          */
/*                                                                     */
/*  Everything is drawn on a 192 x 108 pixel grid and shown as round   */
/*  LEDs. Press F or double-click for fullscreen.                      */
/* ------------------------------------------------------------------ */
export function OverheadLED({
  radius,
  brightness,
  bloom,
}: {
  radius: number
  brightness: number
  bloom: boolean
}) {
  const sky = useSky(radius)
  const idle = useKiosk()
  const vp = useViewport()

  // Whole screen pixels per LED keep the dots crisp. Until the screen is
  // measured (and as a hard cap) CSS fits the panel; see .led-panel.
  const fitted = vp ? Math.floor(Math.min(vp.w / W, vp.h / H)) : 0
  const pitch = fitted >= 1 ? fitted : null
  const sharpScale = (pitch ?? 10) * (vp?.dpr ?? 1)

  const view = useLedView(sky, radius, sharpScale)
  const { canvasRef, bloomRef, sharpRef } = useLedRenderer(view, bloom)

  return (
    <div className={`led-root ${idle ? 'is-idle' : ''}`}>
      <RefreshIndicator active={sky.fetching} variant="led" />
      <ReloadButton visible={!idle} variant="led" />
      <LedPanel
        pitch={pitch}
        brightness={brightness}
        bloom={bloom}
        sharpScale={sharpScale}
        canvasRef={canvasRef}
        bloomRef={bloomRef}
        sharpRef={sharpRef}
      />
    </div>
  )
}
