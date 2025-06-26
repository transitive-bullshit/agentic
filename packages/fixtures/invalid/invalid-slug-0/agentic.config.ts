import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'Test Invalid Slug 0',
  slug: 'Test Invalid Slug 0',
  origin: {
    type: 'raw',
    url: 'https://jsonplaceholder.typicode.com'
  }
})
