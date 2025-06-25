import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-pricing-duplicate-1',
  origin: {
    type: 'raw',
    url: 'https://httpbin.org'
  },
  pricingPlans: [
    {
      name: 'Basic',
      slug: 'basic',
      lineItems: [
        {
          slug: 'custom-test',
          usageType: 'licensed',
          amount: 100
        },
        {
          slug: 'custom-test',
          usageType: 'licensed',
          amount: 200
        }
      ]
    }
  ]
})
