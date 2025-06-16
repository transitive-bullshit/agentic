'use client'

import {
  AgenticApiClient,
  type AuthSession
} from '@agentic/platform-api-client'
import { redirect, RedirectType } from 'next/navigation'
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { useLocalStorage } from 'react-use'

import * as config from '@/lib/config'

type AgenticContextType = {
  api: AgenticApiClient
  logout: () => void
}

const AgenticContext = createContext<AgenticContextType | undefined>(undefined)

export function AgenticProvider({ children }: { children: ReactNode }) {
  const [authSession, setAuthSession] = useLocalStorage<AuthSession | null>(
    'agentic-auth-session'
  )
  const logout = useCallback(() => {
    setAuthSession(null)
  }, [setAuthSession])

  const agenticContext = useRef<AgenticContextType>({
    api: new AgenticApiClient({
      apiBaseUrl: config.apiBaseUrl,
      onUpdateAuth: (updatedAuthSession) => {
        console.log('onUpdateAuth', updatedAuthSession)

        if (
          !!authSession !== !!updatedAuthSession &&
          authSession?.token !== updatedAuthSession?.token
        ) {
          console.log('setAuthSession', updatedAuthSession)
          setAuthSession(updatedAuthSession)
        } else {
          console.log('auth session not updated')
        }
      }
    }),
    logout
  })

  useEffect(() => {
    console.log('updating session from localStorage', authSession?.token)
    if (agenticContext.current) {
      if (authSession) {
        agenticContext.current.api.authSession = authSession
      } else {
        agenticContext.current.api.authSession = undefined
      }
    }
  }, [agenticContext, authSession])

  return (
    <AgenticContext.Provider value={agenticContext.current}>
      {children}
    </AgenticContext.Provider>
  )
}

export function useAgentic(): AgenticContextType {
  const ctx = useContext(AgenticContext)

  if (!ctx) {
    throw new Error('useAgentic must be used within an AgenticProvider')
  }

  return ctx
}

export function useUnauthenticatedAgentic(): AgenticContextType | undefined {
  const ctx = useAgentic()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true)
      return
    }

    if (ctx.api.isAuthenticated) {
      redirect('/app', RedirectType.replace)
    }
  }, [isMounted, setIsMounted, ctx])

  return isMounted ? ctx : undefined
}

export function useAuthenticatedAgentic(): AgenticContextType | undefined {
  const ctx = useAgentic()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true)
      return
    }

    if (!ctx.api.isAuthenticated) {
      redirect('/login', RedirectType.replace)
    }
  }, [isMounted, setIsMounted, ctx])

  return isMounted ? ctx : undefined
}
