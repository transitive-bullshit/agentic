import 'dotenv/config'

import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'Agentic Google Search',
  slug: 'search',
  description:
    'Official Google Search tool. Useful for finding up-to-date news and information about any topic.',
  origin: {
    type: 'mcp',
    url: process.env.MCP_ORIGIN_URL!
  },
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
              unitAmount: 0.01
            },
            {
              upTo: 500_000,
              unitAmount: 0.008
            },
            {
              upTo: 2_500_000,
              unitAmount: 0.006
            },
            {
              upTo: 'inf',
              unitAmount: 0.005
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
