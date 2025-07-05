import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from '@tanstack/react-query'

import { defaultAgenticApiClient } from '@/lib/default-agentic-api-client'

import { MarketplaceIndex } from './marketplace-index'

export default async function MarketplaceIndexPage() {
  const queryClient = new QueryClient()
  const limit = 10

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['featured-public-projects'],
      queryFn: () =>
        defaultAgenticApiClient.listPublicProjects({
          populate: ['lastPublishedDeployment'],
          limit: 3,
          tag: 'featured',
          sortBy: 'createdAt',
          sort: 'asc'
        })
    }),

    queryClient.prefetchInfiniteQuery({
      queryKey: ['public-projects'],
      queryFn: ({ pageParam = 0 }) =>
        defaultAgenticApiClient
          .listPublicProjects({
            populate: ['lastPublishedDeployment'],
            offset: pageParam,
            limit,
            notTag: 'featured'
          })
          .then(async (projects) => {
            return {
              projects,
              offset: pageParam,
              limit,
              nextOffset:
                projects.length >= limit
                  ? pageParam + projects.length
                  : undefined
            }
          }),
      initialPageParam: 0
    })
  ])

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MarketplaceIndex limit={limit} />
    </HydrationBoundary>
  )
}
