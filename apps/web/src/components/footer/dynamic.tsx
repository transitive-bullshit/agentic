'use client'

import { ActiveLink } from '@/components/active-link'
import { useAgentic } from '@/components/agentic-provider'

export function DynamicFooter() {
  const ctx = useAgentic()

  return (
    <>
      {ctx?.isAuthenticated ? (
        <>
          <div>
            <ActiveLink href='/app' className='link'>
              Dashboard
            </ActiveLink>
          </div>

          <div>
            <ActiveLink href='/logout' className='link'>
              Logout
            </ActiveLink>
          </div>
        </>
      ) : (
        <>
          <div>
            <ActiveLink href='/login' className='link whitespace-nowrap'>
              Log in
            </ActiveLink>
          </div>

          <div>
            <ActiveLink href='/signup' className='link whitespace-nowrap'>
              Sign up
            </ActiveLink>
          </div>
        </>
      )}
    </>
  )
}
