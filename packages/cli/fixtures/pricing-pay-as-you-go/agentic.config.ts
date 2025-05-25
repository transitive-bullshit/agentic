import { defineConfig } from '@agentic/platform-schemas'

export default defineConfig({
  name: 'test-pricing-pay-as-you-go',
  originUrl: 'https://httpbin.org',
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
          unitAmount: 0,
          // Free but limited to 20 requests per day
          rateLimit: {
            maxPerInterval: 20,
            interval: 60 * 60 * 24 // 1 day in seconds
          }
        }
      ]
    },
    {
      name: 'Pay-As-You-Go',
      slug: 'pay-as-you-go',
      lineItems: [
        {
          slug: 'requests',
          usageType: 'metered',
          billingScheme: 'tiered',
          tiersMode: 'volume',
          // $0.00467 USD per request up to 999 requests per month
          // then $0.00053 USD for unlimited further requests that month
          tiers: [
            {
              upTo: 999,
              unitAmount: 0.467
            },
            {
              upTo: 'inf',
              unitAmount: 0.053
            }
          ]
        }
      ]
    }
  ]
})
