import { parseProjectIdentifier } from '@agentic/platform-validators'
import { notFound } from 'next/navigation'

import { toastError } from '@/lib/notifications'

import { MarketplacePublicProjectDetail } from '../marketplace-public-project-detail'
import {
  type MarketplacePublicProjectDetailTab,
  marketplacePublicProjectDetailTabsSet
} from '../utils'

export default async function PublicProjectDetailPageTabPage({
  params
}: {
  params: Promise<{
    namespace: string
    'project-slug': string
    tab: string
  }>
}) {
  const {
    namespace: rawNamespace,
    'project-slug': rawProjectSlug,
    tab
  } = await params

  if (!marketplacePublicProjectDetailTabsSet.has(tab)) {
    return notFound()
  }

  try {
    const namespace = decodeURIComponent(rawNamespace)
    const projectSlug = decodeURIComponent(rawProjectSlug)

    const { projectIdentifier } = parseProjectIdentifier(
      `${namespace}/${projectSlug}`,
      { strict: true }
    )

    return (
      <MarketplacePublicProjectDetail
        projectIdentifier={projectIdentifier}
        tab={tab as MarketplacePublicProjectDetailTab}
      />
    )
  } catch (err: any) {
    void toastError(err, { label: 'Invalid project identifier' })

    return notFound()
  }
}
