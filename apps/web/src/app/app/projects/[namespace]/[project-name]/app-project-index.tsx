'use client'

import { useQuery } from '@tanstack/react-query'

import { useAuthenticatedAgentic } from '@/components/agentic-provider'
import { LoadingIndicator } from '@/components/loading-indicator'
import { toastError } from '@/lib/notifications'

export function AppProjectIndex({
  projectIdentifier
}: {
  projectIdentifier: string
}) {
  const ctx = useAuthenticatedAgentic()
  const {
    data: project,
    isLoading,
    isError
  } = useQuery({
    queryKey: ['project', projectIdentifier],
    queryFn: () =>
      ctx?.api
        .getProjectByIdentifier({
          projectIdentifier,
          populate: ['lastPublishedDeployment']
        })
        .catch((err: any) => {
          void toastError(err, {
            label: `Error fetching project "${projectIdentifier}"`
          })

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
        text-4xl font-extrabold tracking-tight
        '
          >
            {project.name}
          </h1>

          <div className='mt-8'>
            <pre className='max-w-lg'>{JSON.stringify(project, null, 2)}</pre>
          </div>
        </>
      )}
    </section>
  )
}
