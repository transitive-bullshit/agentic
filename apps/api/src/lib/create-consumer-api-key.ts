import { sha256 } from '@agentic/platform-core'

export async function createConsumerApiKey(): Promise<string> {
  const hash = await sha256()

  return `sk-${hash}`
}
