import { defineConfig } from '@agentic/platform-schemas'

export default defineConfig({
  name: 'test-pricing-monthly-annual',
  originUrl: 'https://httpbin.org',
  pricingIntervals: ['month', 'year'],
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
      name: 'Basic Monthly',
      slug: 'basic-monthly',
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
      name: 'Basic Annual',
      slug: 'basic-annual',
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
