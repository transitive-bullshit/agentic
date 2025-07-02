import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'Test Metadata 0',
  origin: {
    type: 'raw',
    url: 'https://httpbin.org'
  },
  icon: './agentic-dev-icon-circle-dark.svg',
  readme: './readme.md'
})
