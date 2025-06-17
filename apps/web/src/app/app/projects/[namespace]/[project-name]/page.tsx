import { parseProjectIdentifier } from '@agentic/platform-validators'
import { notFound } from 'next/navigation'

import { toastError } from '@/lib/notifications'

import { AppProjectIndex } from './app-project-index'

export default async function AppProjectIndexPage({
  params
}: {
  params: Promise<{
    namespace: string
    'project-name': string
  }>
}) {
  const { namespace: rawNamespace, 'project-name': rawProjectName } =
    await params

  try {
    const namespace = decodeURIComponent(rawNamespace)
    const projectName = decodeURIComponent(rawProjectName)

    console.log('parsing project identifier', { namespace, projectName })
    const { projectIdentifier } = parseProjectIdentifier(
      `${namespace}/${projectName}`,
      { strict: true }
    )

    return <AppProjectIndex projectIdentifier={projectIdentifier} />
  } catch (err: any) {
    void toastError(err, { label: 'Invalid project identifier' })

    return notFound()
  }
}
