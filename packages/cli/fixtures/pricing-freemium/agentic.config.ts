import { defineConfig, freePricingPlan } from '@agentic/platform-schemas'

export default defineConfig({
  // TODO: resolve name / slug conflicts
  name: 'My Project',
  originUrl: 'https://httpbin.org',
  pricingPlans: [
    freePricingPlan,
    {
      name: 'Basic',
      slug: 'basic',
      // interval: 'month',
      trialPeriodDays: 7,
      lineItems: [
        {
          slug: 'base',
          usageType: 'licensed',
          amount: 490
          // interval: 'month'
        }
      ]
    }
  ]
})
