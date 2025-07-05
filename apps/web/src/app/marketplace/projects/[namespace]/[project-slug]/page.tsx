import { parseProjectIdentifier } from '@agentic/platform-validators'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from '@tanstack/react-query'
import { notFound } from 'next/navigation'

import { defaultAgenticApiClient } from '@/lib/default-agentic-api-client'
import { toastError } from '@/lib/notifications'

import { MarketplacePublicProjectDetail } from './marketplace-public-project-detail'

export default async function MarketplacePublicProjectDetailPage({
  params
}: {
  params: Promise<{
    namespace: string
    'project-slug': string
  }>
}) {
  const { namespace: rawNamespace, 'project-slug': rawProjectSlug } =
    await params

  let projectIdentifier: string
  try {
    const namespace = decodeURIComponent(rawNamespace)
    const projectSlug = decodeURIComponent(rawProjectSlug)

    const parsedProjectIdentifier = parseProjectIdentifier(
      `${namespace}/${projectSlug}`,
      { strict: true }
    )
    projectIdentifier = parsedProjectIdentifier.projectIdentifier
  } catch (err: any) {
    void toastError(err, { label: 'Invalid project identifier' })

    return notFound()
  }

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['public-project', projectIdentifier],
    queryFn: () =>
      defaultAgenticApiClient.getPublicProjectByIdentifier({
        projectIdentifier,
        populate: ['lastPublishedDeployment']
      })
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <MarketplacePublicProjectDetail projectIdentifier={projectIdentifier} />
    </HydrationBoundary>
  )
}
