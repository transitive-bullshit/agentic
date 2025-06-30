import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-pricing-empty-1',
  origin: {
    type: 'raw',
    url: 'https://httpbin.org'
  },
  pricingPlans: [
    {
      name: 'Basic',
      slug: 'basic',
      lineItems: [] as any // this is invalid
    }
  ]
})
