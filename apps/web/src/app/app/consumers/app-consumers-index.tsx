'use client'

import { Loader2Icon } from 'lucide-react'
import { useCallback, useState } from 'react'

import { useAuthenticatedAgentic } from '@/components/agentic-provider'
import { AppConsumersList } from '@/components/app-consumers-list'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { toastError } from '@/lib/notifications'

export function AppConsumersIndex() {
  const ctx = useAuthenticatedAgentic()
  const [isLoadingStripeBillingPortal, setIsLoadingStripeBillingPortal] =
    useState(false)

  const onManageSubscriptions = useCallback(async () => {
    let url: string | undefined
    try {
      setIsLoadingStripeBillingPortal(true)
      const res = await ctx!.api.createBillingPortalSession()
      url = res.url
    } catch (err) {
      void toastError(err, { label: 'Error creating billing portal session' })
    } finally {
      setIsLoadingStripeBillingPortal(false)
    }

    if (url) {
      globalThis.open(url, '_blank')
    }
  }, [ctx])

  return (
    <PageContainer>
      <h1
        className='text-center text-balance leading-snug md:leading-none
        text-4xl font-extrabold'
      >
        Subscriptions
      </h1>

      <Button onClick={onManageSubscriptions}>
        {isLoadingStripeBillingPortal && (
          <Loader2Icon className='animate-spin mr-2' />
        )}

        <span>Manage your subscriptions</span>
      </Button>

      <AppConsumersList />
    </PageContainer>
  )
}
