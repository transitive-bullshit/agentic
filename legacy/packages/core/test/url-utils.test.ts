import test from 'ava'

import { normalizeUrl } from '@/url-utils'

test('normalizeUrl', async (t) => {
  t.is(normalizeUrl('https://www.google.com'), 'https://www.google.com')
  t.is(normalizeUrl('//www.google.com'), 'https://www.google.com')
  t.is(
    normalizeUrl('https://www.google.com/foo?'),
    'https://www.google.com/foo'
  )
  t.is(
    normalizeUrl('https://www.google.com/?foo=bar&dog=cat'),
    'https://www.google.com/?dog=cat&foo=bar'
  )
  t.is(
    normalizeUrl('https://google.com/abc/123//'),
    'https://google.com/abc/123'
  )
})

test('normalizeUrl - invalid urls', async (t) => {
  t.is(normalizeUrl('/foo'), null)
  t.is(normalizeUrl('/foo/bar/baz'), null)
  t.is(normalizeUrl('://foo.com'), null)
  t.is(normalizeUrl('foo'), null)
})
