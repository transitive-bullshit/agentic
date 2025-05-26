import type { AgenticApiClient, AuthUser } from '@agentic/platform-api-client'
import type { Command } from 'commander'

export type Context = {
  client: AgenticApiClient
  program: Command
  logger: {
    log: (...args: any[]) => void
    error: (...args: any[]) => void
  }
}

export type AuthSession = {
  refreshToken: string
  user: AuthUser
}
