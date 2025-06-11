import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-basic-mcp',
  // originUrl: 'http://localhost:8080/stream',
  originUrl: 'https://agentic-basic-mcp-test.onrender.com/mcp',
  originAdapter: {
    type: 'mcp'
  }
})
