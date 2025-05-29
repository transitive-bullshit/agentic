import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-pricing-duplicate-1',
  originUrl: 'https://httpbin.org',
  pricingPlans: [
    {
      name: 'Basic',
      slug: 'basic',
      lineItems: [
        {
          slug: 'custom',
          usageType: 'licensed',
          amount: 100
        },
        {
          slug: 'custom',
          usageType: 'licensed',
          amount: 200
        }
      ]
    }
  ]
})
