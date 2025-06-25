import 'server-only'

import { AgenticApiClient } from '@agentic/platform-api-client'

import { apiBaseUrl } from '@/lib/config'

export const globalAgenticApiClient = new AgenticApiClient({
  apiBaseUrl
})
