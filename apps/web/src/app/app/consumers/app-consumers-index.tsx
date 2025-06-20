'use client'

import { useCallback } from 'react'

import { useAuthenticatedAgentic } from '@/components/agentic-provider'
import { AppConsumersList } from '@/components/app-consumers-list'
import { Button } from '@/components/ui/button'

export function AppConsumersIndex() {
  const ctx = useAuthenticatedAgentic()

  const onManageSubscriptions = useCallback(async () => {
    const { url } = await ctx!.api.createBillingPortalSession()
    globalThis.open(url, '_blank')
  }, [ctx])

  return (
    <>
      <h1
        className='text-center text-balance leading-snug md:leading-none
        text-4xl font-extrabold'
      >
        Subscriptions
      </h1>

      <Button onClick={onManageSubscriptions}>Manage your subscriptions</Button>

      <AppConsumersList />
    </>
  )
}
