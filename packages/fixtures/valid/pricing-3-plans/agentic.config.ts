import { defineConfig } from '@agentic/platform'

export default defineConfig({
  name: 'test-pricing-3-plans',
  originUrl: 'https://httpbin.org',
  pricingPlans: [
    {
      name: 'Free',
      slug: 'free',
      features: [
        'Unlimited images **with watermark**',
        'No backend generation',
        'No custom templates`'
      ],
      lineItems: [
        {
          slug: 'base',
          usageType: 'licensed',
          amount: 0
        }
      ]
    },
    {
      name: 'Starter',
      slug: 'starter',
      features: [
        'Unlimited images **without watermark**',
        'Unlimited backend generation',
        'No custom templates'
      ],
      lineItems: [
        {
          slug: 'base',
          usageType: 'licensed',
          amount: 999 // $9.99 USD
        }
      ]
    },
    {
      name: 'Pro',
      slug: 'pro',
      features: [
        'Unlimited images **without watermark**',
        'Unlimited backend generation',
        'Unlimited custom templates'
      ],
      lineItems: [
        {
          slug: 'base',
          usageType: 'licensed',
          amount: 2999 // $29.99 USD
        }
      ]
    }
  ]
})
