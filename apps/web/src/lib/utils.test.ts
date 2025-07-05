import { expect, test } from 'vitest'

import { pricingAmountToFixedString } from './utils'

test('pricingAmountToFixedString', () => {
  expect(pricingAmountToFixedString(0.008)).toBe('0.00008')
  expect(pricingAmountToFixedString(200)).toBe('2.00')
  expect(pricingAmountToFixedString(52_399)).toBe('523.99')
  expect(pricingAmountToFixedString(0.0)).toBe('0')
  expect(pricingAmountToFixedString(0)).toBe('0')
  expect(pricingAmountToFixedString(0.000_000_000_000_1)).toBe('0')
  expect(pricingAmountToFixedString(0.01)).toBe('0.0001')
  expect(pricingAmountToFixedString(10)).toBe('0.10')
  expect(pricingAmountToFixedString(390)).toBe('3.90')
  expect(pricingAmountToFixedString(1)).toBe('0.01')
})
