import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'Context7',
  slug: 'context7',
  description:
    'Up-to-date code docs for any prompt. LLMs rely on outdated or generic information about the libraries you use, wheres Context7 pulls up-to-date, version-specific documentation and code examples directly from the source.',
  origin: {
    type: 'mcp',
    url: 'https://mcp.context7.com/mcp'
  },
  icon: 'https://avatars.githubusercontent.com/u/74989412?s=48&v=4',
  readme:
    'https://raw.githubusercontent.com/upstash/context7/refs/heads/master/README.md',
  sourceUrl: 'https://github.com/upstash/context7',
  homepageUrl: 'https://context7.com',
  toolConfigs: [
    {
      name: 'resolve-library-id',
      cacheControl:
        'public, max-age=3600, s-maxage=3600 stale-while-revalidate=180',
      examples: [
        {
          name: 'Next.js example',
          featured: true,
          prompt:
            'Create a Next.js middleware that checks for a valid JWT in cookies and redirects unauthenticated users to `/login`. use context7',
          args: {
            libraryName: 'Next.js'
          }
        }
      ]
    },
    {
      name: 'get-library-docs',
      cacheControl:
        'public, max-age=3600, s-maxage=3600 stale-while-revalidate=180'
    }
  ]
})
