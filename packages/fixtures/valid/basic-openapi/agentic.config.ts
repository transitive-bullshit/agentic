import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-basic-openapi',
  originUrl: 'https://jsonplaceholder.typicode.com',
  originAdapter: {
    type: 'openapi',
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
