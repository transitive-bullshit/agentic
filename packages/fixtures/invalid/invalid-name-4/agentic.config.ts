import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: '@foo/bar', // invalid; name contains invalid characters
  origin: {
    type: 'raw',
    url: 'https://jsonplaceholder.typicode.com'
  }
})
