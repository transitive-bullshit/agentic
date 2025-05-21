import { AgenticApiClient } from '@agentic/platform-api-client'

// Create a singleton instance of the API client
export const client = new AgenticApiClient({
  apiKey: process.env.AGENTIC_API_KEY
})
