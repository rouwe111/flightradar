import { createContext, useContext } from 'react'
import type { ClientConfig } from '@/lib/types'

export const ConfigContext = createContext<ClientConfig | null>(null)

export function useConfig() {
  const config = useContext(ConfigContext)
  if (!config) throw new Error('useConfig needs a ConfigContext provider.')
  return config
}
