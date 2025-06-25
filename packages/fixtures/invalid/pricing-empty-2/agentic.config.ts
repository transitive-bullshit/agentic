import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-pricing-empty-2',
  origin: {
    type: 'raw',
    url: 'https://httpbin.org'
  },
  pricingPlans: [] as any // this is invalid
})
