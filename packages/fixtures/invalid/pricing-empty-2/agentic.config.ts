import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-pricing-empty-2',
  originUrl: 'https://httpbin.org',
  pricingPlans: [] as any // this is invalid
})
