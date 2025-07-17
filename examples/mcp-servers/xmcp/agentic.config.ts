import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'XMCP Example',
  slug: 'xmcp',
  description: 'TODO',
  origin: {
    type: 'mcp',
    url: 'https://xmcp.vercel.app/mcp'
  },
  homepageUrl: 'https://xmcp.dev',
  icon: './xmcp.svg'
})
