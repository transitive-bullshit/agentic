'use client'

import useInfiniteScroll from 'react-infinite-scroll-hook'

import { useAgentic } from '@/components/agentic-provider'
import { DotsSection } from '@/components/dots-section'
import { LoadingIndicator } from '@/components/loading-indicator'
import { PageContainer } from '@/components/page-container'
import { PublicProject } from '@/components/public-project'
import { SupplySideCTA } from '@/components/supply-side-cta'
import { useInfiniteQuery } from '@/lib/query-client'

export function MarketplaceIndex() {
  const ctx = useAgentic()
  const limit = 10
  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['projects'],
    queryFn: ({ pageParam = 0 }) =>
      ctx!.api
        .listPublicProjects({
          populate: ['lastPublishedDeployment'],
          offset: pageParam,
          limit
        })
        .then(async (projects) => {
          return {
            projects,
            offset: pageParam,
            limit,
            nextOffset:
              projects.length >= limit ? pageParam + projects.length : undefined
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

  const projects = data ? data.pages.flatMap((p) => p.projects) : []

  return (
    <PageContainer>
      <section>
        <h1
          className='text-center text-balance leading-snug md:leading-none
        text-4xl font-extrabold'
        >
          Marketplace
        </h1>

        {!ctx || isLoading ? (
          <LoadingIndicator />
        ) : (
          <div className='mt-8'>
            <h2 className='text-xl font-semibold mb-4'>Public Projects</h2>

            {isError ? (
              <p>Error fetching projects</p>
            ) : !projects.length ? (
              <p>
                No projects found. This is likely an error on Agentic's side.
                Please refresh or contact support.
              </p>
            ) : (
              <div className='grid grid-cols grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3'>
                {projects.map((project) => (
                  <PublicProject key={project.id} project={project} />
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

      {/* CTA section */}
      <DotsSection className='flex flex-col gap-12 mb-16'>
        <h2 className='text-center text-balance leading-snug md:leading-none text-3xl font-heading'>
          Your API → Paid MCP, Instantly
        </h2>

        <h5 className='text-center max-w-2xl'>
          Run one command to turn any MCP server or OpenAPI service into a paid
          MCP product. With built-in support for every major LLM SDK and MCP
          client.
        </h5>

        <SupplySideCTA variant='docs' />
      </DotsSection>
    </PageContainer>
  )
}
