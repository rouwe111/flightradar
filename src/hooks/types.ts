import type { useSky } from '@/hooks/use-sky'

export type Sky = ReturnType<typeof useSky>

export type Lookup<T> = {
  done: boolean
  data: T | null
  promise: Promise<void>
}

export type Viewport = { w: number; h: number; dpr: number }
