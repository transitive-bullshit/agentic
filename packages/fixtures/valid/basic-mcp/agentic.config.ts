import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'Test Basic MCP',
  slug: 'test-basic-mcp',
  origin: {
    type: 'mcp',
    url: 'https://agentic-basic-mcp-test.onrender.com/mcp'
  }
})
