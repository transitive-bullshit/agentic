import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'Test Metadata 1',
  origin: {
    type: 'raw',
    url: 'https://httpbin.org'
  },
  icon: 'https://agentic.so/agentic-icon-circle-light.svg',
  readme:
    'https://raw.githubusercontent.com/transitive-bullshit/agentic/refs/heads/main/readme.md'
})
