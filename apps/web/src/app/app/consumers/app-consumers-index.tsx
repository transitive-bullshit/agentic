'use client'

import Link from 'next/link'
import useInfiniteScroll from 'react-infinite-scroll-hook'

import { useAuthenticatedAgentic } from '@/components/agentic-provider'
import { LoadingIndicator } from '@/components/loading-indicator'
import { useInfiniteQuery } from '@/lib/query-client'

export function AppConsumersIndex() {
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

  return (
    <>
      <section>
        <h1
          className='text-center text-balance leading-snug md:leading-none
        text-4xl font-extrabold'
        >
          Your Subscriptions
        </h1>

        {!ctx || isLoading ? (
          <LoadingIndicator />
        ) : (
          <div className='mt-8'>
            {isError ? (
              <p>Error fetching customer subscriptions</p>
            ) : !consumers.length ? (
              <p>
                No subscriptions found. Subscribe to your first project to get
                started!
              </p>
            ) : (
              <div className='grid gap-4'>
                {consumers.map((consumer) => (
                  <Link
                    key={consumer.id}
                    className='p-4 border rounded-lg hover:border-gray-400 transition-colors'
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
      </section>
    </>
  )
}
