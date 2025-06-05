import { expect, expectTypeOf, test } from 'vitest'

import {
  type RateLimit,
  type RateLimitInput,
  rateLimitSchema
} from './rate-limit'

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

test('RateLimit types', () => {
  expectTypeOf({
    interval: 10,
    maxPerInterval: 100
  } as const).toExtend<RateLimit>()

  expectTypeOf<{
    interval: 10
    maxPerInterval: 100
  }>().toExtend<RateLimit>()

  expectTypeOf({
    interval: '10s',
    maxPerInterval: 100
  } as const).not.toExtend<RateLimit>()

  expectTypeOf<{
    interval: '10s'
    maxPerInterval: 100
  }>().not.toExtend<RateLimit>()
})

test('RateLimitInput types', () => {
  expectTypeOf({
    interval: 10,
    maxPerInterval: 100
  } as const).toExtend<RateLimitInput>()

  expectTypeOf<{
    interval: 10
    maxPerInterval: 100
  }>().toExtend<RateLimitInput>()

  expectTypeOf({
    interval: '3h',
    maxPerInterval: 100
  } as const).toExtend<RateLimitInput>()

  expectTypeOf<{
    interval: '3h'
    maxPerInterval: 100
  }>().toExtend<RateLimitInput>()
})
