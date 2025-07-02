import { sha256 } from '@agentic/platform-core'

export async function createConsumerApiKey(): Promise<string> {
  return `sk-${sha256()}`
}
