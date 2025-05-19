import { sha256 } from '@agentic/platform-core'

export function createConsumerToken(): string {
  return sha256().slice(0, 24)
}
