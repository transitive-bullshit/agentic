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
  useState
} from 'react'
import { useLocalStorage } from 'react-use'

import * as config from '@/lib/config'

type AgenticContextType = {
  api: AgenticApiClient
  isAuthenticated: boolean
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

  const onUpdateAuth = useCallback(
    (updatedAuthSession?: AuthSession | null) => {
      // console.log('onUpdateAuth', {
      //   authSession: structuredClone(authSession),
      //   updatedAuthSession: structuredClone(updatedAuthSession),
      //   isCurrentlyAuthenticated: agenticContext.isAuthenticated
      // })

      if (
        !!authSession !== !!updatedAuthSession ||
        authSession?.token !== updatedAuthSession?.token ||
        agenticContext.isAuthenticated !== !!updatedAuthSession
      ) {
        setAuthSession(updatedAuthSession)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [authSession, setAuthSession]
  )

  const [agenticContext, setAgenticContext] = useState<AgenticContextType>({
    api: new AgenticApiClient({
      apiBaseUrl: config.apiBaseUrl,
      onUpdateAuth
    }),
    isAuthenticated: !!authSession,
    logout
  })

  useEffect(() => {
    // console.log('updating session from localStorage', authSession?.token)
    if (authSession) {
      // console.log('setting auth session to truthy', {
      //   authSession: structuredClone(authSession),
      //   isAuthenticated: agenticContext.isAuthenticated,
      //   setAgenticContext: !agenticContext.isAuthenticated
      // })

      agenticContext.api.authSession = authSession
      if (!agenticContext.isAuthenticated) {
        setAgenticContext({
          ...agenticContext,
          isAuthenticated: true
        })
      }
    } else {
      // console.log('setting auth session to falsy', {
      //   authSession: structuredClone(authSession),
      //   isAuthenticated: agenticContext.isAuthenticated,
      //   setAgenticContext: !!agenticContext.isAuthenticated
      // })

      agenticContext.api.authSession = undefined

      if (agenticContext.isAuthenticated) {
        setAgenticContext({
          ...agenticContext,
          isAuthenticated: false
        })
      }
    }
  }, [agenticContext, authSession])

  return (
    <AgenticContext.Provider value={agenticContext}>
      {children}
    </AgenticContext.Provider>
  )
}

export function useAgentic(): AgenticContextType | undefined {
  const ctx = useContext(AgenticContext)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    if (!isMounted) {
      setIsMounted(true)
      return
    }
  }, [isMounted, setIsMounted])

  if (!ctx) {
    throw new Error('useAgentic must be used within an AgenticProvider')
  }

  return isMounted ? ctx : undefined
}

export function useUnauthenticatedAgentic(): AgenticContextType | undefined {
  const ctx = useAgentic()

  if (ctx && ctx.isAuthenticated) {
    // console.log('REQUIRES UNAUTHENTICATED: redirecting to /app')
    redirect('/app', RedirectType.replace)
  }

  return ctx
}

export function useAuthenticatedAgentic(): AgenticContextType | undefined {
  const ctx = useAgentic()

  if (ctx && !ctx.isAuthenticated) {
    // console.log('REQUIRES AUTHENTICATED: redirecting to /login')
    redirect('/login', RedirectType.replace)
  }

  return ctx
}
