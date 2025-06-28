'use client'

import Link from 'next/link'
import useInfiniteScroll from 'react-infinite-scroll-hook'

import { useAuthenticatedAgentic } from '@/components/agentic-provider'
import { LoadingIndicator } from '@/components/loading-indicator'
import { useInfiniteQuery } from '@/lib/query-client'

export function AppConsumersList() {
  const ctx = useAuthenticatedAgentic()
  const limit = 10
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['consumers', ctx?.api.authSession?.user?.id],
    queryFn: ({ pageParam = 0 }) =>
      ctx!.api
        .listConsumers({
          populate: ['project'],
          offset: pageParam,
          limit
        })
        .then(async (consumers) => {
          return {
            consumers,
            offset: pageParam,
            limit,
            nextOffset:
              consumers.length >= limit
                ? pageParam + consumers.length
                : undefined
          }
        }),
    getNextPageParam: (lastGroup) => lastGroup?.nextOffset,
    enabled: !!ctx,
    initialPageParam: 0
  })

  const [sentryRef] = useInfiniteScroll({
    loading: isLoading || isFetchingNextPage,
    hasNextPage,
    onLoadMore: fetchNextPage,
    disabled: !ctx || isError,
    rootMargin: '0px 0px 200px 0px'
  })

  const consumers = data ? data.pages.flatMap((p) => p.consumers) : []
  const numConsumers = consumers.length

  return (
    <>
      {!ctx || isLoading ? (
        <LoadingIndicator />
      ) : (
        <div className='mt-8'>
          <h2 className='text-xl font-semibold mb-4'>Your Subscriptions</h2>

          {isError ? (
            <p>Error fetching customer subscriptions</p>
          ) : !consumers.length ? (
            <p>
              No subscriptions found. Subscribe to your first project to get
              started.
            </p>
          ) : (
            <div
              className={`grid grid-cols grid-cols-1 gap-4 sm:grid-cols-${Math.min(
                2,
                numConsumers
              )} xl:grid-cols-${Math.min(3, numConsumers)}`}
            >
              {consumers.map((consumer) => (
                <Link
                  key={consumer.id}
                  className='p-4 border rounded-lg hover:border-gray-400 transition-colors overflow-hidden'
                  href={`/app/consumers/${consumer.id}`}
                >
                  <h3 className='font-medium'>{consumer.project.name}</h3>

                  <p className='text-sm text-gray-500'>
                    {consumer.project.identifier}
                  </p>

                  <pre className='max-w-lg'>
                    {JSON.stringify(consumer, null, 2)}
                  </pre>
                </Link>
              ))}

              {hasNextPage && (
                <div ref={sentryRef} className=''>
                  {isLoading || (isFetchingNextPage && <LoadingIndicator />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  )
}
