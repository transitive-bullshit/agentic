import { sha256 } from '@agentic/platform-core'

export async function createConsumerToken(): Promise<string> {
  return sha256()
}
