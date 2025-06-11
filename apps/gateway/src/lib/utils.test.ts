import { expect, test } from 'vitest'

import {
  isCacheControlPubliclyCacheable,
  isRequestPubliclyCacheable
} from './utils'

test('isRequestPubliclyCacheable true', () => {
  expect(isRequestPubliclyCacheable(new Request('https://example.com'))).toBe(
    true
  )
  expect(
    isRequestPubliclyCacheable(
      new Request('https://example.com', {
        headers: {
          'cache-control': 'public, max-age=3600'
        }
      })
    )
  ).toBe(true)
})

test('isRequestPubliclyCacheable false', () => {
  expect(
    isRequestPubliclyCacheable(
      new Request('https://example.com', {
        headers: {
          pragma: 'no-cache'
        }
      })
    )
  ).toBe(false)
  expect(
    isRequestPubliclyCacheable(
      new Request('https://example.com', {
        headers: {
          'cache-control': 'no-store'
        }
      })
    )
  ).toBe(false)
})

test('isCacheControlPubliclyCacheable true', () => {
  expect(isCacheControlPubliclyCacheable('public')).toBe(true)
  expect(isCacheControlPubliclyCacheable('public, max-age=3600')).toBe(true)
  expect(isCacheControlPubliclyCacheable('public, s-maxage=3600')).toBe(true)
  expect(
    isCacheControlPubliclyCacheable('public, max-age=3600, s-maxage=3600')
  ).toBe(true)
  expect(isCacheControlPubliclyCacheable('max-age=3600')).toBe(true)
  expect(isCacheControlPubliclyCacheable('s-maxage=3600')).toBe(true)
  expect(
    isCacheControlPubliclyCacheable(
      'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600'
    )
  ).toBe(true)
  expect(isCacheControlPubliclyCacheable('stale-while-revalidate=180')).toBe(
    true
  )
})

test('isCacheControlPubliclyCacheable false', () => {
  expect(isCacheControlPubliclyCacheable('no-store')).toBe(false)
  expect(isCacheControlPubliclyCacheable('no-cache')).toBe(false)
  expect(isCacheControlPubliclyCacheable('private')).toBe(false)
  expect(isCacheControlPubliclyCacheable('private, max-age=3600')).toBe(false)
  expect(isCacheControlPubliclyCacheable('private, s-maxage=3600')).toBe(false)
  expect(
    isCacheControlPubliclyCacheable('private, max-age=3600, s-maxage=3600')
  ).toBe(false)
  expect(
    isCacheControlPubliclyCacheable('max-age=0, must-revalidate, no-cache')
  ).toBe(false)
  expect(
    isCacheControlPubliclyCacheable('private, max-age=3600, must-revalidate')
  ).toBe(false)
})
