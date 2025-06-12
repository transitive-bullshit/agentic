import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-pricing-custom-0',
  originUrl: 'https://httpbin.org',
  pricingIntervals: ['month', 'year'],
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
      name: 'Basic Monthly',
      slug: 'basic-monthly',
      interval: 'month',
      lineItems: [
        {
          slug: 'base',
          usageType: 'licensed',
          amount: 500
        },
        {
          slug: 'custom-test',
          usageType: 'metered',
          billingScheme: 'per_unit',
          unitAmount: 100
        }
      ],
      rateLimit: {
        limit: 1000,
        // TODO
        // interval: '30d' // 60 * 60 * 24 * 30 // 30 days in seconds
        interval: 60 * 60 * 24 * 30 // 30 days in seconds
      }
    },
    {
      name: 'Basic Annual',
      slug: 'basic-annual',
      interval: 'year',
      lineItems: [
        {
          slug: 'base',
          usageType: 'licensed',
          amount: 400 * 12 // 20% discount
        },
        {
          slug: 'custom-test',
          usageType: 'metered',
          billingScheme: 'per_unit',
          unitAmount: 80 // 20% discount
        }
      ],
      rateLimit: {
        limit: 1500,
        interval: 60 * 60 * 24 * 30 // 30 days in seconds
      }
    }
  ]
})
