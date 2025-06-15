import { AgenticApiClient } from '@agentic/platform-api-client'

import { env } from './env'

export const client = new AgenticApiClient({
  apiBaseUrl: env.AGENTIC_API_BASE_URL,
  apiKey: env.AGENTIC_DEV_ACCESS_TOKEN
})
