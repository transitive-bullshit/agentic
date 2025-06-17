'use client'

import { useAuthenticatedAgentic } from '@/components/agentic-provider'
import { LoadingIndicator } from '@/components/loading-indicator'
import { useQuery } from '@/lib/query-client'

export function AppConsumerIndex({ consumerId }: { consumerId: string }) {
  const ctx = useAuthenticatedAgentic()
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
