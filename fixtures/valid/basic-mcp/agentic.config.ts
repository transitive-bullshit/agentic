import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'Test Basic MCP',
  origin: {
    type: 'mcp',
    url: 'https://agentic-basic-mcp-test.onrender.com/mcp'
  },

  toolConfigs: [
    {
      name: 'add',
      pure: true
    }
  ]
})
