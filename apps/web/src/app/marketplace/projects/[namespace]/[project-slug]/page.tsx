import { parseProjectIdentifier } from '@agentic/platform-validators'
import { notFound } from 'next/navigation'

import { toastError } from '@/lib/notifications'

import { MarketplaceProjectIndex } from './marketplace-project-index'

export default async function MarketplaceProjectIndexPage({
  params
}: {
  params: Promise<{
    namespace: string
    'project-slug': string
  }>
}) {
  const { namespace: rawNamespace, 'project-slug': rawProjectSlug } =
    await params

  try {
    const namespace = decodeURIComponent(rawNamespace)
    const projectSlug = decodeURIComponent(rawProjectSlug)

    const { projectIdentifier } = parseProjectIdentifier(
      `${namespace}/${projectSlug}`,
      { strict: true }
    )

    return <MarketplaceProjectIndex projectIdentifier={projectIdentifier} />
  } catch (err: any) {
    void toastError(err, { label: 'Invalid project identifier' })

    return notFound()
  }
}
