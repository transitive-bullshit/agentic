import { defineConfig } from '@agentic/platform-schemas'

export default defineConfig({
  name: 'test-pricing-empty-0',
  originUrl: 'https://httpbin.org',
  pricingIntervals: [] as any, // this is invalid
  pricingPlans: [
    {
      name: 'Basic',
      slug: 'basic',
      lineItems: [
        {
          slug: 'base',
          usageType: 'licensed',
          amount: 499 // $4.99 USD
        }
      ]
    }
  ]
})
