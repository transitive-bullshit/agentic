import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'Test Invalid Name 4',
  slug: '@foo/bar', // invalid; slug contains invalid characters
  origin: {
    type: 'raw',
    url: 'https://jsonplaceholder.typicode.com'
  }
})
