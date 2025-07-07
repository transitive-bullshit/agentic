'use client'

import { Loader2Icon } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useAuthenticatedAgentic } from '@/components/agentic-provider'
import { useConfettiFireworks } from '@/components/confetti'
import { LoadingIndicator } from '@/components/loading-indicator'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { toastError } from '@/lib/notifications'
import { useQuery } from '@/lib/query-client'

export function AppConsumerIndex({ consumerId }: { consumerId: string }) {
  const ctx = useAuthenticatedAgentic()
  const searchParams = useSearchParams()
  const checkout = searchParams.get('checkout')
  const plan = searchParams.get('plan')
  const { fireConfetti } = useConfettiFireworks()
  const [isLoadingStripeBillingPortal, setIsLoadingStripeBillingPortal] =
    useState(false)

  const {
    data: consumer,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['consumer', consumerId],
    queryFn: () =>
      ctx!.api.getConsumer({
        consumerId,
        populate: ['project']
      }),
    enabled: !!ctx
  })

  const firstLoadConsumer = useRef(true)

  useEffect(() => {
    if (!ctx || !consumer || !firstLoadConsumer.current) return

    if (checkout === 'canceled') {
      firstLoadConsumer.current = false
      toast('Subscription canceled')
    } else if (checkout === 'success') {
      if (plan) {
        firstLoadConsumer.current = false
        toast(
          `Congrats! You are now subscribed to the "${plan}" plan for project "${consumer.project.name}"`,
          {
            duration: 10_000
          }
        )

        // Return the confetti cleanup handler, so if this component is
        // unmounted, the confetti will stop as well.
        return fireConfetti()
      } else {
        firstLoadConsumer.current = false
        toast(
          `Your subscription has been cancelled for project "${consumer.project.name}"`,
          {
            duration: 10_000
          }
        )
      }
    }
  }, [checkout, ctx, plan, consumer, fireConfetti])

  const onManageSubscription = useCallback(async () => {
    if (!ctx || !consumer) {
      void toastError('Failed to create billing portal session')
      return
    }

    let url: string | undefined
    try {
      setIsLoadingStripeBillingPortal(true)
      const res = await ctx!.api.createConsumerBillingPortalSession({
        consumerId: consumer.id
      })
      url = res.url
    } catch (err) {
      void toastError(err, { label: 'Error creating billing portal session' })
    } finally {
      setIsLoadingStripeBillingPortal(false)
    }

    if (url) {
      globalThis.open(url, '_blank')
    }
  }, [ctx, consumer])

  return (
    <PageContainer>
      <section className='flex flex-col gap-16'>
        {!ctx || isLoading ? (
          <LoadingIndicator />
        ) : isError ? (
          <p>Error fetching customer subscription "{consumerId}"</p>
        ) : !consumer ? (
          <p>Customer subscription "{consumerId}" not found</p>
        ) : (
          <>
            <h1
              className='text-center text-balance leading-snug md:leading-none
        text-4xl font-extrabold'
            >
              Subscription to {consumer.project.name}
            </h1>

            <div className=''>
              <pre className='max-w-lg'>
                {JSON.stringify(consumer, null, 2)}
              </pre>
            </div>

            <Button
              onClick={onManageSubscription}
              disabled={isLoadingStripeBillingPortal}
            >
              {isLoadingStripeBillingPortal && (
                <Loader2Icon className='animate-spin mr-2' />
              )}

              <span>Manage Subscription</span>
            </Button>
          </>
        )}
      </section>
    </PageContainer>
  )
}
