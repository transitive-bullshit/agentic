import { AgenticApiClient } from '@agentic/platform-api-client'

import { apiBaseUrl } from './config'

export const defaultAgenticApiClient = new AgenticApiClient({
  apiBaseUrl
})
