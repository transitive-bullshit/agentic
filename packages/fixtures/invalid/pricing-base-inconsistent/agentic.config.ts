import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-pricing-base-inconsistent',
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
        }
      ]
    },
    {
      name: 'Starter',
      slug: 'starter',
      lineItems: [
        {
          slug: 'base',
          usageType: 'metered',
          billingScheme: 'per_unit',
          unitAmount: 0.467
        }
      ]
    }
  ]
})
