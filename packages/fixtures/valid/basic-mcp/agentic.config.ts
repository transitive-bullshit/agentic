import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-basic-mcp',
  originUrl: 'http://localhost:8080',
  originAdapter: {
    type: 'mcp'
  }
})
