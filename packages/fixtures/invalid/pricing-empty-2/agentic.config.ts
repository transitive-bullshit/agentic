import { defineConfig } from '@agentic/platform-schemas'

export default defineConfig({
  name: 'test-pricing-empty-2',
  originUrl: 'https://httpbin.org',
  pricingPlans: [] as any // this is invalid
})
