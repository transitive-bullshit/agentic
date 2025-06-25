import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-invalid-origin-url-0',
  origin: {
    type: 'raw',
    url: 'http://jsonplaceholder.typicode.com' // invalid http url (missing https)
  }
})
