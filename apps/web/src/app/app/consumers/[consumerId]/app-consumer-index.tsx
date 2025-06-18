'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { useAuthenticatedAgentic } from '@/components/agentic-provider'
import { useConfettiFireworks } from '@/components/confetti'
import { LoadingIndicator } from '@/components/loading-indicator'
import { useQuery } from '@/lib/query-client'

export function AppConsumerIndex({ consumerId }: { consumerId: string }) {
  const ctx = useAuthenticatedAgentic()
  const searchParams = useSearchParams()
  const checkout = searchParams.get('checkout')
  const plan = searchParams.get('plan')
  const { fireConfetti } = useConfettiFireworks()

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

    if (checkout === 'success') {
      if (plan) {
        firstLoadConsumer.current = false
        toast(
          `Congrats! You are now subscribed to the "${plan}" plan for project "${consumer.project.name}"`
        )
        fireConfetti()
      } else {
        firstLoadConsumer.current = false
        toast(
          `Your subscription has been cancelled for project "${consumer.project.name}"`
        )
      }
    }
  }, [checkout, ctx, plan, consumer, fireConfetti])

  return (
    <section>
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

          <div className='mt-8'>
            <pre className='max-w-lg'>{JSON.stringify(consumer, null, 2)}</pre>
          </div>
        </>
      )}
    </section>
  )
}
