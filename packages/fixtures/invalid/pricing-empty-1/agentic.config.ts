import { defineConfig } from '@agentic/platform-schemas'

export default defineConfig({
  name: 'test-pricing-empty-1',
  originUrl: 'https://httpbin.org',
  pricingPlans: [
    {
      name: 'Basic',
      slug: 'basic',
      lineItems: [] as any // this is invalid
    }
  ]
})
