import { defineConfig } from '@agentic/platform'

export default defineConfig({
  slug: 'test-invalid-name-0',
  origin: {
    type: 'raw',
    url: 'https://jsonplaceholder.typicode.com'
  }
} as any) // invalid; missing name
