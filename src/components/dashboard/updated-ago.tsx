import { useNow } from '@/hooks/use-now'

/** ", updated 4s ago"; ticks every second on its own. */
export function UpdatedAgo({ at }: { at: number | null }) {
  const now = useNow()
  if (!at || !now) return null
  return <>, updated {Math.max(0, Math.round((now - at) / 1000))}s ago</>
}
