import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-invalid-origin-url-1',
  origin: {
    type: 'raw',
    url: 'https://' // invalid https url
  }
})
