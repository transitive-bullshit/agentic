import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'Test Invalid Slug 1',
  slug: 'Test-Invalid-Slug-1',
  origin: {
    type: 'raw',
    url: 'https://jsonplaceholder.typicode.com'
  }
})
