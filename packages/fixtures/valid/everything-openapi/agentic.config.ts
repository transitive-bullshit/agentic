import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-everything-openapi',
  originUrl: 'https://agentic-platform-fixtures-everything.onrender.com',
  originAdapter: {
    type: 'openapi',
    spec: 'https://agentic-platform-fixtures-everything.onrender.com/docs'
  },
  toolConfigs: [
    {
      name: 'get_user',
      enabled: true,
      pure: true,
      // cacheControl: 'no-cache',
      reportUsage: true,
      rateLimit: null,
      pricingPlanOverridesMap: {
        free: {
          enabled: true,
          reportUsage: true
        }
      }
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
        maxPerInterval: 10
      }
    },
    {
      name: 'disabled_rate_limit_tool',
      rateLimit: null
    },
    {
      name: 'strict_additional_properties',
      additionalProperties: false
    }
  ]
})
