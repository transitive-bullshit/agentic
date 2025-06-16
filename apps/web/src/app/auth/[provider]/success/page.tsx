import { assert } from '@agentic/platform-core'

import { SuccessPage } from './success-page'

export default async function Page({
  params
}: {
  params: Promise<{ provider: string }>
}) {
  const { provider } = await params
  assert(provider, 'Missing provider')

  return <SuccessPage provider={provider} />
}
