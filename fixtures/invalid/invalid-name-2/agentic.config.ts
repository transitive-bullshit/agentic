import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: '', // invalid; must not be empty
  slug: 'test-invalid-name-1',
  origin: {
    type: 'raw',
    url: 'https://jsonplaceholder.typicode.com'
  }
})
