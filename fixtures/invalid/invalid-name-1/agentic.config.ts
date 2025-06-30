import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'a'.repeat(1025), // invalid; too long
  slug: 'test-invalid-name-2',
  origin: {
    type: 'raw',
    url: 'https://jsonplaceholder.typicode.com'
  }
})
