import { expect, test } from 'vitest'

import { rateLimitSchema } from './rate-limit'

test('rateLimitSchema valid', () => {
  expect(
    rateLimitSchema.parse({
      interval: 10,
      maxPerInterval: 100
    })
  ).toMatchSnapshot()

  expect(
    rateLimitSchema.parse({
      interval: '10s',
      maxPerInterval: 100
    })
  ).toMatchSnapshot()

  expect(
    rateLimitSchema.parse({
      interval: '1 day',
      maxPerInterval: 1000
    })
  ).toMatchSnapshot()
})

test('rateLimitSchema invalid', () => {
  expect(() =>
    rateLimitSchema.parse({
      interval: '',
      maxPerInterval: 5
    })
  ).toThrowErrorMatchingSnapshot()

  expect(() =>
    rateLimitSchema.parse({
      interval: 0,
      maxPerInterval: 5
    })
  ).toThrowErrorMatchingSnapshot()

  expect(() =>
    rateLimitSchema.parse({
      interval: '--',
      maxPerInterval: 10
    })
  ).toThrowErrorMatchingSnapshot()

  expect(() =>
    rateLimitSchema.parse({
      interval: '1 day',
      maxPerInterval: -1000
    })
  ).toThrowErrorMatchingSnapshot()
})
