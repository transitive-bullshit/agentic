'use client'

import { ActiveLink } from '@/components/active-link'
import { useAgentic } from '@/components/agentic-provider'

export function DynamicHeader() {
  const ctx = useAgentic()

  return (
    <>
      {ctx?.isAuthenticated ? (
        <>
          <ActiveLink href='/app' className='link'>
            Dashboard
          </ActiveLink>

          <ActiveLink href='/logout' className='link'>
            Logout
          </ActiveLink>
        </>
      ) : (
        <>
          <ActiveLink href='/login' className='link whitespace-nowrap'>
            Log in
          </ActiveLink>

          <ActiveLink href='/signup' className='link whitespace-nowrap'>
            Sign up
          </ActiveLink>
        </>
      )}
    </>
  )
}
