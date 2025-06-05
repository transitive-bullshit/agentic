import { sha256 } from '@agentic/platform-core'

export async function createConsumerToken(): Promise<string> {
  const hash = await sha256()

  return hash.slice(0, 24)
}
