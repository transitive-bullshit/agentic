'use client'

import {
  AgenticApiClient,
  type AuthSession
} from '@agentic/platform-api-client'
import { redirect, RedirectType } from 'next/navigation'
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState
} from 'react'
import { useLocalStorage } from 'react-use'

import * as config from '@/lib/config'

type AgenticContext = {
  api: AgenticApiClient
}

const AgenticContext = createContext<AgenticContext | undefined>(undefined)

export function AgenticProvider({ children }: { children: ReactNode }) {
  const [authSession, setAuthSession] = useLocalStorage<AuthSession>(
    'agentic-auth-session'
  )
  const agenticContext = useRef<AgenticContext>({
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
    })
  })

  useEffect(() => {
    console.log('setting session from localStorage', authSession?.token)
    agenticContext.current.api.authSession = authSession
  }, [agenticContext, authSession])

  return (
    <AgenticContext.Provider value={agenticContext.current}>
      {children}
    </AgenticContext.Provider>
  )
}

export function useAgentic(): AgenticContext {
  const ctx = useContext(AgenticContext)

  if (!ctx) {
    throw new Error('useAgentic must be used within an AgenticProvider')
  }

  return ctx
}

export function useUnauthenticatedAgentic(): AgenticContext | undefined {
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

export function useAuthenticatedAgentic(): AgenticContext | undefined {
  const ctx = useAgentic()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true)
      return
    }

    if (!ctx.api.isAuthenticated) {
      redirect('/', RedirectType.replace)
    }
  }, [isMounted, setIsMounted, ctx])

  return isMounted ? ctx : undefined
}
