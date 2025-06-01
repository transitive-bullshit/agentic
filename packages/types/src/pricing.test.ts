import { assert, expectTypeOf, test } from 'vitest'

import type {
  CustomPricingPlanLineItemSlug,
  PricingPlanLineItem,
  PricingPlanList
} from './pricing'

test('PricingPlanLineItem "base" type', () => {
  expectTypeOf({
    slug: 'base',
    usageType: 'licensed',
    amount: 100
  } as const).toExtend<PricingPlanLineItem>()

  expectTypeOf<{
    slug: 'base'
    usageType: 'licensed'
    amount: number
  }>().toExtend<PricingPlanLineItem>()
})

test('PricingPlanLineItem "requests" per-unit type', () => {
  expectTypeOf({
    slug: 'requests',
    usageType: 'metered',
    billingScheme: 'per_unit',
    unitAmount: 100
  } as const).toExtend<PricingPlanLineItem>()

  expectTypeOf<{
    slug: 'requests'
    usageType: 'metered'
    billingScheme: 'per_unit'
    unitAmount: number
  }>().toExtend<PricingPlanLineItem>()

  expectTypeOf({
    slug: 'requests',
    usageType: 'metered',
    billingScheme: 'per_unit'
    // invalid because `unitAmount` is required
  } as const).not.toExtend<PricingPlanLineItem>()

  expectTypeOf<{
    slug: 'requests'
    usageType: 'metered'
    billingScheme: 'per_unit'
    unitAmount?: number // invalid because `unitAmount` is required
  }>().not.toExtend<PricingPlanLineItem>()
})

test('PricingPlanLineItem "requests" tiered type', () => {
  expectTypeOf<{
    slug: 'requests'
    usageType: 'metered'
    billingScheme: 'tiered'
    tiersMode: 'volume'
    tiers: [
      {
        amount: 300
        upTo: 1000
      },
      {
        amount: 200
        upTo: 2000
      },
      {
        amount: 100
        upTo: 'inf'
      }
    ]
  }>().toExtend<PricingPlanLineItem>()
})

test('PricingPlanLineItem "custom" licensed type', () => {
  expectTypeOf({
    slug: 'custom-licensed',
    usageType: 'licensed',
    amount: 100
  } as const).toExtend<PricingPlanLineItem>()

  expectTypeOf<{
    slug: 'custom-licensed'
    usageType: 'licensed'
    amount: number
  }>().toExtend<PricingPlanLineItem>()
})

test('PricingPlanLineItem "custom" metered per-unit type', () => {
  expectTypeOf({
    slug: 'custom-test',
    usageType: 'metered',
    billingScheme: 'per_unit',
    unitAmount: 100
  } as const).toExtend<PricingPlanLineItem>()

  expectTypeOf<{
    slug: 'custom-test'
    usageType: 'metered'
    billingScheme: 'per_unit'
    unitAmount: number
  }>().toExtend<PricingPlanLineItem>()
})

test('PricingPlanLineItem "custom" metered tiered type', () => {
  expectTypeOf<{
    slug: 'custom-test'
    usageType: 'metered'
    billingScheme: 'tiered'
    tiersMode: 'volume'
    tiers: [
      {
        amount: 300
        upTo: 1000
      },
      {
        amount: 200
        upTo: 2000
      },
      {
        amount: 100
        upTo: 'inf'
      }
    ]
  }>().toExtend<PricingPlanLineItem>()
})

test('PricingPlanList type', () => {
  // Empty array should be invalid
  expectTypeOf<[]>().not.toExtend<PricingPlanList>()

  // Empty lineItems should be invalid
  expectTypeOf<
    [
      {
        name: 'Free'
        slug: 'free'
        lineItems: []
      }
    ]
  >().not.toExtend<PricingPlanList>()

  expectTypeOf<
    [
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
  >().toExtend<PricingPlanList>()
})

test('PricingPlanLineItem "base" type discrimination', () => {
  const foo: PricingPlanLineItem = {
    slug: 'base',
    usageType: 'licensed',
    amount: 100
  }

  expectTypeOf(foo).toExtend<PricingPlanLineItem>()

  // These should fail if `slug` is not differentiating correctly.
  expectTypeOf(foo).toExtend<{
    slug: 'base'
    usageType: 'licensed'
    amount: number
    label?: string
  }>()
  expectTypeOf<typeof foo>().toExtend<{
    slug: 'base'
  }>()
  expectTypeOf<typeof foo>().toExtend<{
    usageType: 'licensed'
  }>()
})

test('PricingPlanLineItem "requests" per-unit type discrimination', () => {
  const foo: PricingPlanLineItem = {
    slug: 'requests',
    usageType: 'metered',
    billingScheme: 'per_unit',
    unitAmount: 100
  }

  expectTypeOf(foo).toExtend<PricingPlanLineItem>()

  // These should fail if `slug` is not differentiating correctly.
  expectTypeOf<typeof foo>().toExtend<{
    slug: 'requests'
  }>()
  expectTypeOf<typeof foo>().toExtend<{
    usageType: 'metered'
  }>()
  expectTypeOf<typeof foo>().toExtend<{
    billingScheme: 'per_unit'
  }>()
  expectTypeOf<typeof foo>().toExtend<{
    unitAmount: number
  }>()
})

test('PricingPlanLineItem "metered" type discrimination', () => {
  const foo = {
    usageType: 'metered'
  } as PricingPlanLineItem

  expectTypeOf(foo).toExtend<PricingPlanLineItem>()
  assert(foo.usageType === 'metered')

  // These should fail if `usageType` is not differentiating correctly.
  expectTypeOf<typeof foo>().toExtend<{
    slug: 'requests' | CustomPricingPlanLineItemSlug
  }>()
  expectTypeOf<typeof foo>().toExtend<{
    billingScheme: 'per_unit' | 'tiered'
  }>()
})
