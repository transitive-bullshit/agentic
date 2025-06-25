import 'dotenv/config'

import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'search',
  origin: {
    type: 'mcp',
    url: process.env.MCP_ORIGIN_URL!
  },
  toolConfigs: [
    {
      name: 'search',
      cacheControl: 'public, max-age=60, s-maxage=60 stale-while-revalidate=10'
    }
  ]
})
