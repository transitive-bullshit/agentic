import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'Test Invalid Metadata 0',
  origin: {
    type: 'raw',
    url: 'https://httpbin.org'
  },
  icon: false as any
})
