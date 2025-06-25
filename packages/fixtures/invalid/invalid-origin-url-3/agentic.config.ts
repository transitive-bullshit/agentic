import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-invalid-origin-url-3',
  origin: {
    type: 'raw',
    url: '' // invalid https url
  }
})
