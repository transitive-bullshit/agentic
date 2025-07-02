import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'Test Metadata 1',
  origin: {
    type: 'raw',
    url: 'https://httpbin.org'
  },
  readme: './not-found.md'
})
