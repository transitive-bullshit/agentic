import { expectTypeOf, test } from 'vitest'

import type { AgenticProjectConfigInput } from './agentic-project-config'

test('AgenticProjectConfig input types', () => {
  expectTypeOf<{
    name: 'test'
    origin: {
      type: 'openapi'
      url: 'https://httpbin.org'
      spec: './openapi.json'
    }
  }>().toExtend<AgenticProjectConfigInput>()

  expectTypeOf<{
    name: 'test'
    origin: {
      type: 'openapi'
      url: 'https://httpbin.org'
      spec: './openapi.json'
    }
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
    origin: {
      type: 'openapi'
      url: 'https://httpbin.org'
      spec: './openapi.json'
    }
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
          }
        ]
        rateLimit: {
          // Make sure `interval` can use a string as input
          interval: '30s'
          limit: 100
        }
      }
    ]
  }>().toExtend<AgenticProjectConfigInput>()

  expectTypeOf<{
    name: 'test'
    origin: {
      type: 'openapi'
      url: 'https://httpbin.org'
      spec: './openapi.json'
    }
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
          }
        ]
        rateLimit: {
          // Make sure `interval` can use a number as input
          interval: 300
          limit: 100
        }
      }
    ]
  }>().toExtend<AgenticProjectConfigInput>()

  expectTypeOf<{
    name: 'test'
    origin: {
      type: 'openapi'
      url: 'https://httpbin.org'
      spec: './openapi.json'
    }
    // Invalid because `pricingPlans` must be non-empty if defined
    pricingPlans: []
  }>().not.toExtend<AgenticProjectConfigInput>()

  expectTypeOf<{
    name: 'test'
    origin: {
      type: 'openapi'
      url: 'https://httpbin.org'
      spec: './openapi.json'
    }
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
