import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: ' ',
  origin: {
    type: 'raw',
    url: 'https://jsonplaceholder.typicode.com'
  }
} as any) // invalid; missing slug
