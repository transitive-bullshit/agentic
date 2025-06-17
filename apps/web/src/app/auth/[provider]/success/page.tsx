import { assert } from '@agentic/platform-core'

import { OAuthSuccessCallback } from './oauth-success-callback'

export default async function Page({
  params
}: {
  params: Promise<{ provider: string }>
}) {
  const { provider } = await params
  assert(provider, 'Missing provider')

  return <OAuthSuccessCallback provider={provider} />
}
