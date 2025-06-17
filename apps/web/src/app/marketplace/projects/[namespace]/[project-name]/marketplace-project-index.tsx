'use client'

import { useQuery } from '@tanstack/react-query'

import { useAgentic } from '@/components/agentic-provider'
import { LoadingIndicator } from '@/components/loading-indicator'
import { toastError } from '@/lib/notifications'

export function MarketplaceProjectIndex({
  projectIdentifier
}: {
  projectIdentifier: string
}) {
  const ctx = useAgentic()
  const {
    data: project,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['project', projectIdentifier],
    queryFn: () =>
      ctx!.api
        .getPublicProjectByIdentifier({
          projectIdentifier,
          populate: ['lastPublishedDeployment']
        })
        .catch((err: any) => {
          void toastError(`Failed to fetch project "${projectIdentifier}"`)
          throw err
        }),
    enabled: !!ctx
  })

  return (
    <section>
      {!ctx || isLoading ? (
        <LoadingIndicator />
      ) : isError ? (
        <p>Error fetching project</p>
      ) : !project ? (
        <p>Project "{projectIdentifier}" not found</p>
      ) : (
        <>
          <h1
            className='text-center text-balance leading-snug md:leading-none
        text-4xl font-extrabold'
          >
            Project {project.name}
          </h1>

          <div className='mt-8'>
            <pre className='max-w-lg'>{JSON.stringify(project, null, 2)}</pre>
          </div>
        </>
      )}
    </section>
  )
}
