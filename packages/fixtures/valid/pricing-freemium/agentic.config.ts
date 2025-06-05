import { defaultFreePricingPlan, defineConfig } from '@agentic/platform'

export default defineConfig({
  // TODO: resolve name / slug conflicts
  name: 'test-pricing-freemium',
  originUrl: 'https://httpbin.org',
  pricingPlans: [
    defaultFreePricingPlan,
    {
      name: 'Basic',
      slug: 'basic',
      trialPeriodDays: 7,
      lineItems: [
        {
          slug: 'base',
          usageType: 'licensed',
          amount: 499 // $4.99 USD
        }
      ]
    }
  ]
})
