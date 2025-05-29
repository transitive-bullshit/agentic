import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-pricing-duplicate-0',
  originUrl: 'https://httpbin.org',
  pricingIntervals: ['month', 'year'],
  pricingPlans: [
    {
      name: 'Basic',
      slug: 'basic',
      interval: 'month',
      lineItems: [
        {
          slug: 'custom',
          usageType: 'licensed',
          amount: 100
        }
      ]
    },
    {
      name: 'Basic',
      slug: 'basic', // invalid duplicate slug
      interval: 'year',
      lineItems: [
        {
          slug: 'custom',
          usageType: 'licensed',
          amount: 70
        }
      ]
    }
  ]
})
