import { expectTypeOf, test } from 'vitest'

import type { AgenticProjectConfigInput } from './agentic-project-config'

test('AgenticProjectConfig input types', () => {
  expectTypeOf<{
    name: 'test'
    originUrl: 'https://httpbin.org'
  }>().toExtend<AgenticProjectConfigInput>()

  expectTypeOf<{
    name: 'test'
    originUrl: 'https://httpbin.org'
    pricingPlans: [
      {
        name: 'Free'
        slug: 'free'
        lineItems: [
          {
            slug: 'base'
            usageType: 'licensed'
            amount: 0
          }
        ]
      }
    ]
  }>().toExtend<AgenticProjectConfigInput>()

  expectTypeOf<{
    name: 'test'
    originUrl: 'https://httpbin.org'
    pricingPlans: [
      {
        name: 'Basic Monthly'
        slug: 'basic-monthly'
        lineItems: [
          {
            slug: 'requests'
            usageType: 'metered'
            billingScheme: 'per_unit'
            unitAmount: 50
            rateLimit: {
              // Make sure `interval` can use a string as input
              interval: '30s'
              maxPerInterval: 100
            }
          }
        ]
      }
    ]
  }>().toExtend<AgenticProjectConfigInput>()

  expectTypeOf<{
    name: 'test'
    originUrl: 'https://httpbin.org'
    pricingPlans: [
      {
        name: 'Basic Monthly'
        slug: 'basic-monthly'
        lineItems: [
          {
            slug: 'requests'
            usageType: 'metered'
            billingScheme: 'per_unit'
            unitAmount: 50
            rateLimit: {
              // Make sure `interval` can use a number as input
              interval: 300
              maxPerInterval: 100
            }
          }
        ]
      }
    ]
  }>().toExtend<AgenticProjectConfigInput>()

  expectTypeOf<{
    name: 'test'
    originUrl: 'https://httpbin.org'
    // Invalid because `pricingPlans` must be non-empty if defined
    pricingPlans: []
  }>().not.toExtend<AgenticProjectConfigInput>()

  expectTypeOf<{
    name: 'test'
    originUrl: 'https://httpbin.org'
    pricingPlans: [
      {
        name: 'Basic Monthly'
        slug: 'basic-monthly'
        // Invalid because `lineItems` must be non-empty
        lineItems: []
      }
    ]
  }>().not.toExtend<AgenticProjectConfigInput>()
})
