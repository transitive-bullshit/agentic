'use client'

import { AgenticApiClient } from '@agentic/platform-api-client'
import React from 'react'

import * as config from '@/lib/config'

type AgenticContextType = {
  api: AgenticApiClient
}

const defaultAgenticContext: AgenticContextType = {
  api: new AgenticApiClient({
    apiBaseUrl: config.apiBaseUrl
  })
}

const AgenticContext = React.createContext<AgenticContextType | undefined>(
  undefined
)

export function AgenticProvider({ children }: { children: React.ReactNode }) {
  return (
    <AgenticContext.Provider value={defaultAgenticContext}>
      {children}
    </AgenticContext.Provider>
  )
}

export function useAgentic() {
  const agenticContext = React.useContext(AgenticContext)

  if (!agenticContext) {
    throw new Error('useAgentic must be used within an AgenticProvider')
  }

  return agenticContext
}
