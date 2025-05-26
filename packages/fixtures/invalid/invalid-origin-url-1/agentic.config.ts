import { defineConfig } from '@agentic/platform-schemas'

export default defineConfig({
  name: 'test-invalid-origin-url-1',
  originUrl: 'https://' // invalid https url
})
