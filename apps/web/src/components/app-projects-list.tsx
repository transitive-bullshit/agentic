'use client'

import Link from 'next/link'
import useInfiniteScroll from 'react-infinite-scroll-hook'

import { useAuthenticatedAgentic } from '@/components/agentic-provider'
import { LoadingIndicator } from '@/components/loading-indicator'
import { useInfiniteQuery } from '@/lib/query-client'

export function AppProjectsList() {
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
    queryKey: ['projects', ctx?.api.authSession?.user?.id],
    queryFn: ({ pageParam = 0 }) =>
      ctx!.api
        .listProjects({
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
    <>
      {!ctx || isLoading ? (
        <LoadingIndicator />
      ) : (
        <div className='mt-8'>
          <h2 className='text-xl font-semibold mb-4'>Your Projects</h2>

          {isError ? (
            <p>Error fetching projects</p>
          ) : !projects.length ? (
            <p>No projects found. Create your first project to get started.</p>
          ) : (
            <div className='grid gap-4'>
              {projects.map((project) => (
                <Link
                  key={project.id}
                  className='p-4 border rounded-lg hover:border-gray-400 transition-colors overflow-hidden'
                  href={`/app/projects/${project.identifier}`}
                >
                  <h3 className='font-medium'>{project.name}</h3>

                  <p className='text-sm text-gray-500'>{project.identifier}</p>

                  {project.lastPublishedDeployment && (
                    <p className='text-sm text-gray-500 mt-1'>
                      Last published:{' '}
                      {project.lastPublishedDeployment.version ||
                        project.lastPublishedDeployment.hash}
                    </p>
                  )}
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
