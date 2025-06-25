import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-pricing-duplicate-0',
  origin: {
    type: 'raw',
    url: 'https://httpbin.org'
  },
  pricingIntervals: ['month', 'year'],
  pricingPlans: [
    {
      name: 'Basic',
      slug: 'basic',
      interval: 'month',
      lineItems: [
        {
          slug: 'custom-test',
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
          slug: 'custom-test',
          usageType: 'licensed',
          amount: 70
        }
      ]
    }
  ]
})
