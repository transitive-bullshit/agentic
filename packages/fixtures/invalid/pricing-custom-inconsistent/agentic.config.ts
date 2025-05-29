import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-pricing-custom-inconsistent',
  originUrl: 'https://httpbin.org',
  pricingPlans: [
    {
      name: 'Free',
      slug: 'free',
      lineItems: [
        {
          slug: 'custom',
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
          slug: 'custom',
          usageType: 'metered',
          billingScheme: 'per_unit',
          unitAmount: 100
        }
      ]
    }
  ]
})
