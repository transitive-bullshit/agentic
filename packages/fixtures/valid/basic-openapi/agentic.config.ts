import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'Test Basic OpenAPI',
  slug: 'test-basic-openapi',
  origin: {
    type: 'openapi',
    url: 'https://jsonplaceholder.typicode.com',
    spec: './jsonplaceholder.json'
  },
  toolConfigs: [
    {
      name: 'get_posts',
      pure: true
    },
    {
      name: 'get_post',
      pure: true
    }
  ]
})
