import { AgenticApiClient } from '@agentic/platform-api-client'

import { AuthStore } from './store'

// Create a singleton instance of the API client
export const client = new AgenticApiClient({
  apiCookie: AuthStore.tryGetAuth()?.cookie,
  apiBaseUrl: 'http://localhost:3000'
})
