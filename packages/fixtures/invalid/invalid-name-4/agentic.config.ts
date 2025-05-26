import { defineConfig } from '@agentic/platform-schemas'

export default defineConfig({
  name: '@foo/bar', // invalid; name contains invalid characters
  originUrl: 'https://jsonplaceholder.typicode.com'
})
