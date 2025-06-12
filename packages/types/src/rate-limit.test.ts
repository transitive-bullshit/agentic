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
      limit: 100
    })
  ).toMatchSnapshot()

  expect(
    rateLimitSchema.parse({
      interval: '10s',
      limit: 100
    })
  ).toMatchSnapshot()

  expect(
    rateLimitSchema.parse({
      interval: '1 day',
      limit: 1000,
      async: false
    })
  ).toMatchSnapshot()

  expect(
    rateLimitSchema.parse({
      enabled: false
    })
  ).toMatchSnapshot()

  expect(
    rateLimitSchema.parse({
      interval: '10m',
      limit: 100,
      async: false,
      enabled: false
    })
  ).toMatchSnapshot()
})

test('rateLimitSchema invalid', () => {
  expect(() =>
    rateLimitSchema.parse({
      interval: '',
      limit: 5
    })
  ).toThrowErrorMatchingSnapshot()

  expect(() =>
    rateLimitSchema.parse({
      interval: 0,
      limit: 5
    })
  ).toThrowErrorMatchingSnapshot()

  expect(() =>
    rateLimitSchema.parse({
      interval: '--',
      limit: 10
    })
  ).toThrowErrorMatchingSnapshot()

  expect(() =>
    rateLimitSchema.parse({
      interval: '1 day',
      limit: -1000
    })
  ).toThrowErrorMatchingSnapshot()
})

test('RateLimit types', () => {
  expectTypeOf({
    interval: 10,
    limit: 100,
    async: false,
    enabled: true
  } as const).toExtend<RateLimit>()

  expectTypeOf<{
    interval: 10
    limit: 100
    async: false
    enabled: true
  }>().toExtend<RateLimit>()

  expectTypeOf({
    interval: '10s',
    limit: 100,
    async: true,
    enabled: true
  } as const).not.toExtend<RateLimit>()

  expectTypeOf<{
    interval: '10s'
    limit: 100
    async: false
  }>().not.toExtend<RateLimit>()

  expectTypeOf({
    enabled: false
  } as const).toExtend<RateLimit>()

  expectTypeOf<{
    enabled: false
  }>().toExtend<RateLimit>()
})

test('RateLimitInput types', () => {
  expectTypeOf({
    interval: 10,
    limit: 100
  } as const).toExtend<RateLimitInput>()

  expectTypeOf<{
    interval: 10
    limit: 100
  }>().toExtend<RateLimitInput>()

  expectTypeOf({
    interval: 10,
    limit: 100,
    async: false
  } as const).toExtend<RateLimitInput>()

  expectTypeOf<{
    interval: 10
    limit: 100
    async: boolean
  }>().toExtend<RateLimitInput>()

  expectTypeOf({
    interval: '3h',
    limit: 100
  } as const).toExtend<RateLimitInput>()

  expectTypeOf<{
    interval: '3h'
    limit: 100
  }>().toExtend<RateLimitInput>()

  expectTypeOf({
    enabled: false
  } as const).toExtend<RateLimitInput>()

  expectTypeOf<{
    enabled: false
  }>().toExtend<RateLimitInput>()
})
