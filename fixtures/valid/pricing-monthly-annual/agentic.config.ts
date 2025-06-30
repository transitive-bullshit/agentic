import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-pricing-monthly-annual',
  origin: {
    type: 'raw',
    url: 'https://httpbin.org'
  },
  pricingIntervals: ['month', 'year'],
  pricingPlans: [
    {
      name: 'Free',
      slug: 'free',
      lineItems: [
        {
          slug: 'custom-base',
          usageType: 'licensed',
          amount: 0
        }
      ]
    },
    {
      name: 'Basic Monthly',
      slug: 'basic-monthly',
      interval: 'month',
      lineItems: [
        {
          slug: 'custom-base',
          usageType: 'licensed',
          amount: 100
        }
      ]
    },
    {
      name: 'Basic Annual',
      slug: 'basic-annual',
      interval: 'year',
      lineItems: [
        {
          slug: 'custom-base',
          usageType: 'licensed',
          amount: 70
        }
      ]
    }
  ]
})
