import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-basic-raw-free-ts',
  origin: {
    type: 'raw',
    url: 'https://jsonplaceholder.typicode.com'
  }
})
