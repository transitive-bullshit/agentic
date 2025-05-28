import type { AgenticApiClient } from '@agentic/platform-api-client'

import type { AgenticEnv } from './env'

export type Context = ExecutionContext & {
  req: Request
  env: AgenticEnv
  client: AgenticApiClient
}
