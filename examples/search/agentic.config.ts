import 'dotenv/config'

import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'search',
  originUrl: process.env.MCP_ORIGIN_URL!,
  originAdapter: {
    type: 'mcp'
  },
  toolConfigs: [
    {
      name: 'search',
      cacheControl: 'public, max-age=60, s-maxage=60 stale-while-revalidate=10'
    }
  ]
})
