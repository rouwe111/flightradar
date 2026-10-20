import { RotateCwIcon } from '@/components/shared/rotate-cw-icon'
import type { ScreenVariant } from '@/components/shared/types'
import '@/components/shared/reload-button.css'

/**
 * Restarts the screen when it seems stuck. Shown top left while the screen
 * is awake (a tap or mouse move), hidden when idle. It only becomes tappable
 * a moment after it appears, so the tap that wakes the screen can't reload
 * it by accident.
 */
export function ReloadButton({
  visible,
  variant,
}: {
  visible: boolean
  variant: ScreenVariant
}) {
  return (
    <button
      type="button"
      className={`fr-reload fr-reload-${variant} ${visible ? 'is-visible' : ''}`}
      aria-label="Reload the screen"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      onClick={() => window.location.reload()}
      onDoubleClick={(event) => event.stopPropagation()}
    >
      <RotateCwIcon />
      <span>Reload</span>
    </button>
  )
}
