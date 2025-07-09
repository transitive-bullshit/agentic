import 'dotenv/config'

import { defineConfig } from '@agentic/platform'

if (!process.env.GITHUB_TOKEN) {
  throw new Error('GITHUB_TOKEN is not set')
}

export default defineConfig({
  name: 'GitHub',
  slug: 'github',
  description:
    'The GitHub MCP Server is a Model Context Protocol (MCP) server that provides seamless integration with GitHub APIs, enabling advanced automation and interaction capabilities for developers and tools.',
  origin: {
    type: 'mcp',
    url: 'https://api.githubcopilot.com/mcp/',
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`
    }
  },
  icon: './github-mark.svg',
  readme:
    'https://raw.githubusercontent.com/github/github-mcp-server/refs/heads/main/README.md',
  sourceUrl: 'https://github.com/github/github-mcp-server',
  homepageUrl: 'https://github.com',
  toolConfigs: [
    {
      name: 'get_me',
      examples: [
        {
          featured: true,
          prompt: 'Get my github user information',
          args: {
            reason: 'github hack night!'
          }
        }
      ]
    }
  ]
})
