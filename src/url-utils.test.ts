import { describe, expect, test } from 'vitest'

import { normalizeUrl } from './url-utils.js'

describe('normalizeUrl', () => {
  test('valid urls', async () => {
    expect(normalizeUrl('https://www.google.com')).toBe(
      'https://www.google.com'
    )
    expect(normalizeUrl('//www.google.com')).toBe('https://www.google.com')
    expect(normalizeUrl('https://www.google.com/foo?')).toBe(
      'https://www.google.com/foo'
    )
    expect(normalizeUrl('https://www.google.com/?foo=bar&dog=cat')).toBe(
      'https://www.google.com/?dog=cat&foo=bar'
    )
    expect(normalizeUrl('https://google.com/abc/123//')).toBe(
      'https://google.com/abc/123'
    )
  })

  test('invalid urls', async () => {
    expect(normalizeUrl('/foo')).toBe(null)
    expect(normalizeUrl('/foo/bar/baz')).toBe(null)
    expect(normalizeUrl('://foo.com')).toBe(null)
    expect(normalizeUrl('foo')).toBe(null)
    expect(normalizeUrl('')).toBe(null)
    expect(normalizeUrl(undefined as unknown as string)).toBe(null)
    expect(normalizeUrl(null as unknown as string)).toBe(null)
  })
})
