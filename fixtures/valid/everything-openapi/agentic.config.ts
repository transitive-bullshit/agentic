import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'Test Everything OpenAPI',
  slug: 'test-everything-openapi',
  origin: {
    type: 'openapi',
    url: 'https://agentic-platform-fixtures-everything.onrender.com',
    spec: 'https://agentic-platform-fixtures-everything.onrender.com/docs'
  },
  icon: 'https://storage.agentic.so/agentic-dev-icon-circle-dark.svg',
  readme: './readme.md',
  toolConfigs: [
    {
      name: 'get_user',
      enabled: true,
      pure: true,
      // cacheControl: 'no-cache',
      reportUsage: true,
      rateLimit: { enabled: false },
      pricingPlanOverridesMap: {
        free: {
          enabled: true,
          reportUsage: true
        }
      }
    },
    {
      name: 'echo',
      examples: [
        {
          name: 'Example 1',
          prompt: 'Use the echo tool to say hello.',
          featured: true,
          args: {
            message: 'Hello, world!'
          }
        }
      ]
    },
    {
      name: 'disabled_tool',
      enabled: false
    },
    {
      name: 'disabled_for_free_plan_tool',
      pricingPlanOverridesMap: {
        free: {
          enabled: false
        }
      }
    },
    {
      name: 'pure',
      pure: true
    },
    {
      name: 'unpure_marked_pure',
      pure: true
    },
    {
      name: 'custom_cache_control_tool',
      cacheControl:
        'public, max-age=7200, s-maxage=7200, stale-while-revalidate=3600'
    },
    {
      name: 'no_cache_cache_control_tool',
      cacheControl: 'no-cache'
    },
    {
      name: 'no_store_cache_control_tool',
      cacheControl: 'no-store'
    },
    {
      name: 'custom_rate_limit_tool',
      rateLimit: {
        interval: '30s',
        limit: 2,
        mode: 'strict'
      }
    },
    {
      name: 'custom_rate_limit_approximate_tool',
      rateLimit: {
        interval: '30s',
        limit: 2,
        mode: 'approximate'
      }
    },
    {
      name: 'disabled_rate_limit_tool',
      rateLimit: { enabled: false }
    },
    {
      name: 'strict_additional_properties',
      inputSchemaAdditionalProperties: false,
      outputSchemaAdditionalProperties: false
    }
  ],
  pricingPlans: [
    {
      name: 'Free',
      slug: 'free',
      lineItems: [
        {
          slug: 'base',
          usageType: 'licensed',
          amount: 0
        },
        {
          slug: 'requests',
          usageType: 'metered',
          billingScheme: 'per_unit',
          unitAmount: 0
        }
      ]
    },
    {
      name: 'Starter',
      slug: 'starter',
      lineItems: [
        {
          slug: 'base',
          usageType: 'licensed',
          amount: 999 // $9.99 USD
        },
        {
          slug: 'requests',
          usageType: 'metered',
          billingScheme: 'tiered',
          tiersMode: 'volume',
          // free for first 1000 requests per month
          // then $0.00053 USD for unlimited further requests that month
          tiers: [
            {
              upTo: 1000,
              unitAmount: 0
            },
            {
              upTo: 'inf',
              unitAmount: 0.053
            }
          ]
        }
      ]
    },
    {
      name: 'Pro',
      slug: 'pro',
      lineItems: [
        {
          slug: 'base',
          usageType: 'licensed',
          amount: 2999 // $29.99 USD
        },
        {
          slug: 'requests',
          usageType: 'metered',
          billingScheme: 'tiered',
          tiersMode: 'volume',
          // free for first 10000 requests per month
          // then $0.00049 USD for unlimited further requests that month
          tiers: [
            {
              upTo: 10_000,
              unitAmount: 0
            },
            {
              upTo: 'inf',
              unitAmount: 0.049
            }
          ]
        }
      ]
    }
  ]
})
