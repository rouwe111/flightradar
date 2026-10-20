import { useEffect, useReducer } from 'react'
import { MAX_LOOKUPS } from '@/hooks/constants'
import type { Lookup } from '@/hooks/types'

const lookups = new Map<string, Lookup<unknown>>()

/**
 * Runs `load` once per key for the life of the page and shares the result:
 * aircraft details, airlines and logos change rarely. A failed lookup is
 * remembered as "nothing" and not retried.
 */
export function useLookup<T>(
  key: string | null,
  load: () => Promise<T | null>,
) {
  const [, rerender] = useReducer((n: number) => n + 1, 0)
  useEffect(() => {
    if (!key) return
    let entry = lookups.get(key) as Lookup<T> | undefined
    if (!entry) {
      const created: Lookup<T> = {
        done: false,
        data: null,
        promise: Promise.resolve(),
      }
      created.promise = load()
        .catch(() => null)
        .then((data) => {
          created.data = data
          created.done = true
        })
      if (lookups.size >= MAX_LOOKUPS) {
        const oldest = lookups.keys().next().value
        if (oldest !== undefined) lookups.delete(oldest)
      }
      lookups.set(key, created as Lookup<unknown>)
      entry = created
    }
    if (entry.done) return
    let alive = true
    void entry.promise.then(() => {
      if (alive) rerender()
    })
    return () => {
      alive = false
    }
    // `load` only depends on `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  const entry = key ? (lookups.get(key) as Lookup<T> | undefined) : undefined
  return {
    data: entry?.done ? entry.data : null,
    loading: !!key && !entry?.done,
  }
}
