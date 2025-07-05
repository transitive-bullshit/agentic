import type { Project } from '@agentic/platform-types'
import { UTCDate } from '@date-fns/utc'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

export function PublicProject({ project }: { project: Project }) {
  const deployment = project.lastPublishedDeployment!
  if (!deployment) return null

  return (
    <Link
      key={project.id}
      className='p-3 border rounded-lg hover:border-gray-400
      divide-y divide-gray-200 overflow-hidden bg-white shadow-sm max-w-md flex flex-col gap-3
      '
      href={`/marketplace/projects/${project.identifier}`}
    >
      <div className='pb-3 flex gap-2.5 items-center'>
        <img
          src={
            deployment.iconUrl ||
            project.user?.image ||
            '/agentic-icon-circle-light.svg'
          }
          alt={project.name}
          className='aspect-square w-8 h-8'
        />

        <div className='flex flex-col gap-1'>
          <h3 className='font-semibold text-lg text-gray-900 leading-tight'>
            {project.name}
          </h3>

          <p className='text-sm text-gray-500'>{project.identifier}</p>
        </div>
      </div>

      <div className='flex-1 flex flex-col gap-3 justify-between'>
        <p className='text-sm text-gray-700 line-clamp-4'>
          {deployment.description}
        </p>

        {project.lastPublishedDeployment && (
          <div className='text-xs text-gray-500 flex gap-3 items-center justify-between'>
            <div>{deployment.version}</div>

            <div>
              Last published{' '}
              {formatDistanceToNow(new UTCDate(deployment.createdAt), {
                addSuffix: true
              })}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
