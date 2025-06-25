import 'dotenv/config'

import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'search',
  description:
    'Google Search tool. Useful for finding up-to-date news and information about any topic.',
  origin: {
    type: 'mcp',
    url: process.env.MCP_ORIGIN_URL!
  },
  toolConfigs: [
    {
      name: 'search',
      // Allow results to be cached publicly for ~1 minute
      cacheControl: 'public, max-age=60, s-maxage=60 stale-while-revalidate=10'
    }
  ]
})
