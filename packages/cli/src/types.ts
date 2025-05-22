import type { AgenticApiClient } from '@agentic/platform-api-client'
import type { Command } from 'commander'

export type Context = {
  client: AgenticApiClient
  program: Command
  logger: {
    log: (...args: any[]) => void
  }
}
