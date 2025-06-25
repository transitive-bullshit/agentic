import { assert } from '@agentic/platform-core'
import { Suspense } from 'react'

import { OAuthSuccessCallback } from './oauth-success-callback'

export default async function Page({
  params
}: {
  params: Promise<{ provider: string }>
}) {
  const { provider } = await params
  assert(provider, 'Missing provider')

  return (
    <Suspense>
      <OAuthSuccessCallback provider={provider} />
    </Suspense>
  )
}
