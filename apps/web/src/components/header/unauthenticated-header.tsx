'use client'

import { ActiveLink } from '@/components/active-link'
import { useAgentic } from '@/components/agentic-provider'
import { Button } from '@/components/ui/button'

export function UnauthenticatedHeader() {
  const ctx = useAgentic()

  if (ctx?.isAuthenticated) {
    return null
  }

  return (
    <>
      <Button asChild variant='outline'>
        <ActiveLink href='/login' className='whitespace-nowrap px-4! py-2!'>
          Log in
        </ActiveLink>
      </Button>

      <Button asChild variant='default'>
        <ActiveLink href='/signup' className='whitespace-nowrap px-4! py-2!'>
          Sign up
        </ActiveLink>
      </Button>
    </>
  )
}
