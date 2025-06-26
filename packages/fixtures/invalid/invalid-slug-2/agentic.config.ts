import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'Test Invalid Slug 2',
  slug: 'test_invalid_slug_2',
  origin: {
    type: 'raw',
    url: 'https://jsonplaceholder.typicode.com'
  }
})
