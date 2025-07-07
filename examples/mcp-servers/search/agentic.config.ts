import 'dotenv/config'

import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'Agentic Google Search',
  slug: 'search',
  description:
    'Google Search API built specifically for LLMs. Agents should use this tool for searching the web in order to find up-to-date news and information about any topic.',
  origin: {
    type: 'mcp',
    url: process.env.MCP_ORIGIN_URL!
  },
  icon: './google.svg',
  sourceUrl:
    'https://github.com/transitive-bullshit/agentic/tree/main/examples/mcp-servers/search',
  homepageUrl: 'https://agentic.so',
  toolConfigs: [
    {
      name: 'search',
      cacheControl: 'public, max-age=60, s-maxage=60 stale-while-revalidate=10'
    }
  ],
  pricingPlans: [
    {
      name: 'Free',
      slug: 'free',
      lineItems: [
        {
          slug: 'requests',
          usageType: 'metered',
          billingScheme: 'per_unit',
          unitAmount: 0
        }
      ],
      // Limit free-tier requests to 10 per day
      rateLimit: {
        interval: '1d',
        limit: 10
      }
    },
    {
      name: 'Standard',
      slug: 'standard',
      lineItems: [
        {
          slug: 'base',
          usageType: 'licensed',
          amount: 1000
        },
        {
          slug: 'requests',
          usageType: 'metered',
          billingScheme: 'tiered',
          tiersMode: 'volume',
          tiers: [
            {
              upTo: 1000,
              unitAmount: 0
            },
            {
              upTo: 50_000,
              unitAmount: 0.1
            },
            {
              upTo: 500_000,
              unitAmount: 0.08
            },
            {
              upTo: 2_500_000,
              unitAmount: 0.06
            },
            {
              upTo: 'inf',
              unitAmount: 0.05
            }
          ]
        }
      ],
      rateLimit: {
        interval: '1s',
        limit: 100
      }
    }
  ]
})
