import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-pricing-custom-inconsistent',
  origin: {
    type: 'raw',
    url: 'https://httpbin.org'
  },
  pricingPlans: [
    {
      name: 'Free',
      slug: 'free',
      lineItems: [
        {
          slug: 'custom-test',
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
          slug: 'custom-test',
          usageType: 'metered',
          billingScheme: 'per_unit',
          unitAmount: 100
        }
      ]
    }
  ]
})
