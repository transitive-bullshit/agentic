import { defineConfig } from '@agentic/platform'

export default defineConfig({
  origin: {
    type: 'raw',
    url: 'https://jsonplaceholder.typicode.com'
  }
} as any) // invalid; missing name
