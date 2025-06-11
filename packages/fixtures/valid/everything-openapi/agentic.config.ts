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
      name: 'getUser',
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
      name: 'disabledTool',
      enabled: false
    },
    {
      name: 'disabledForFreePlanTool',
      pricingPlanOverridesMap: {
        free: {
          enabled: false
        }
      }
    },
    {
      name: 'pureTool',
      pure: true
    },
    {
      name: 'unpureToolMarkedPure',
      pure: true
    },
    {
      name: 'customCacheControlTool',
      cacheControl:
        'public, max-age=7200, s-maxage=7200, stale-while-revalidate=3600'
    },
    {
      name: 'noCacheCacheControlTool',
      cacheControl: 'no-cache'
    },
    {
      name: 'noStoreCacheControlTool',
      cacheControl: 'no-store'
    },
    {
      name: 'customRateLimitTool',
      rateLimit: {
        interval: '30s',
        maxPerInterval: 10
      }
    },
    {
      name: 'disabledRateLimitTool',
      rateLimit: null
    }
  ]
})
