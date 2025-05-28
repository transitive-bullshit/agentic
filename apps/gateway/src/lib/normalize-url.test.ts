import { expect, test } from 'vitest'

import { normalizeUrl } from './normalize-url'

test('main', () => {
  expect(normalizeUrl('http://sindresorhus.com')).toBe(
    'https://sindresorhus.com'
  )
  expect(normalizeUrl('http://sindresorhus.com ')).toBe(
    'https://sindresorhus.com'
  )
  expect(normalizeUrl('http://sindresorhus.com.')).toBe(
    'https://sindresorhus.com'
  )
  expect(normalizeUrl('http://SindreSorhus.com')).toBe(
    'https://sindresorhus.com'
  )
  expect(normalizeUrl('http://sindresorhus.com')).toBe(
    'https://sindresorhus.com'
  )
  expect(normalizeUrl('HTTP://sindresorhus.com')).toBe(
    'https://sindresorhus.com'
  )

  // TODO: why isn't this parsed correctly by Node.js URL?
  // t.is(normalizeUrl('//sindresorhus.com'), 'https://sindresorhus.com')

  expect(normalizeUrl('http://sindresorhus.com')).toBe(
    'https://sindresorhus.com'
  )
  expect(normalizeUrl('http://sindresorhus.com:80')).toBe(
    'https://sindresorhus.com'
  )
  expect(normalizeUrl('https://sindresorhus.com:443')).toBe(
    'https://sindresorhus.com'
  )
  expect(normalizeUrl('ftp://sindresorhus.com:21')).toBe(
    'ftp://sindresorhus.com'
  )
  expect(normalizeUrl('https://sindresorhus.com/foo/')).toBe(
    'https://sindresorhus.com/foo'
  )
  expect(normalizeUrl('http://sindresorhus.com/?foo=bar baz')).toBe(
    'https://sindresorhus.com/?foo=bar+baz'
  )
  expect(normalizeUrl('https://foo.com/https://bar.com')).toBe(
    'https://foo.com/https://bar.com'
  )
  expect(normalizeUrl('https://foo.com/https://bar.com/foo//bar')).toBe(
    'https://foo.com/https://bar.com/foo/bar'
  )
  expect(normalizeUrl('https://foo.com/http://bar.com')).toBe(
    'https://foo.com/http://bar.com'
  )
  expect(normalizeUrl('https://foo.com/http://bar.com/foo//bar')).toBe(
    'https://foo.com/http://bar.com/foo/bar'
  )
  expect(normalizeUrl('https://foo.com/http://bar.com/foo//bar')).toBe(
    'https://foo.com/http://bar.com/foo/bar'
  )
  expect(normalizeUrl('https://sindresorhus.com/%7Efoo/')).toBe(
    'https://sindresorhus.com/~foo'
  )
  expect(normalizeUrl('https://sindresorhus.com/?')).toBe(
    'https://sindresorhus.com'
  )
  expect(normalizeUrl('https://êxample.com')).toBe('https://xn--xample-hva.com')
  expect(
    normalizeUrl('https://sindresorhus.com/?b=bar&a=foo'),
    'https://sindresorhus.com/?a=foo&b=bar'
  )
  expect(normalizeUrl('https://sindresorhus.com/?foo=bar*|<>:"')).toBe(
    'https://sindresorhus.com/?foo=bar*%7C%3C%3E%3A%22'
  )
  expect(normalizeUrl('https://sindresorhus.com:5000')).toBe(
    'https://sindresorhus.com:5000'
  )
  expect(normalizeUrl('https://sindresorhus.com/foo#bar')).toBe(
    'https://sindresorhus.com/foo#bar'
  )
  expect(normalizeUrl('https://sindresorhus.com/foo/bar/../baz')).toBe(
    'https://sindresorhus.com/foo/baz'
  )
  expect(normalizeUrl('https://sindresorhus.com/foo/bar/./baz')).toBe(
    'https://sindresorhus.com/foo/bar/baz'
  )
  expect(
    normalizeUrl(
      'https://i.vimeocdn.com/filter/overlay?src0=https://i.vimeocdn.com/video/598160082_1280x720.jpg&src1=https://f.vimeocdn.com/images_v6/share/play_icon_overlay.png'
    )
  ).toBe(
    'https://i.vimeocdn.com/filter/overlay?src0=https%3A%2F%2Fi.vimeocdn.com%2Fvideo%2F598160082_1280x720.jpg&src1=https%3A%2F%2Ff.vimeocdn.com%2Fimages_v6%2Fshare%2Fplay_icon_overlay.png'
  )
})

test('removeTrailingSlash and removeDirectoryIndex options)', () => {
  expect(normalizeUrl('https://sindresorhus.com/path/')).toBe(
    'https://sindresorhus.com/path'
  )
  expect(normalizeUrl('https://sindresorhus.com/#/path/')).toBe(
    'https://sindresorhus.com/#/path/'
  )
  expect(normalizeUrl('https://sindresorhus.com/foo/#/bar/')).toBe(
    'https://sindresorhus.com/foo#/bar/'
  )
})

test('sortQueryParameters', () => {
  expect(normalizeUrl('https://sindresorhus.com/?a=Z&b=Y&c=X&d=W')).toBe(
    'https://sindresorhus.com/?a=Z&b=Y&c=X&d=W'
  )
  expect(normalizeUrl('https://sindresorhus.com/?b=Y&c=X&a=Z&d=W')).toBe(
    'https://sindresorhus.com/?a=Z&b=Y&c=X&d=W'
  )
  expect(normalizeUrl('https://sindresorhus.com/?a=Z&d=W&b=Y&c=X')).toBe(
    'https://sindresorhus.com/?a=Z&b=Y&c=X&d=W'
  )
  expect(normalizeUrl('https://sindresorhus.com/')).toBe(
    'https://sindresorhus.com'
  )
})

test('invalid urls', () => {
  expect(() => {
    normalizeUrl('http://')
  }).toThrow('Invalid URL: http://')

  expect(() => {
    normalizeUrl('/')
  }).toThrow('Invalid URL: /')

  expect(() => {
    normalizeUrl('/relative/path/')
  }).toThrow('Invalid URL: /relative/path/')
})

test('remove duplicate pathname slashes', () => {
  expect(normalizeUrl('https://sindresorhus.com////foo/bar')).toBe(
    'https://sindresorhus.com/foo/bar'
  )
  expect(normalizeUrl('https://sindresorhus.com////foo////bar')).toBe(
    'https://sindresorhus.com/foo/bar'
  )
  expect(normalizeUrl('ftp://sindresorhus.com//foo')).toBe(
    'ftp://sindresorhus.com/foo'
  )
  expect(normalizeUrl('https://sindresorhus.com:5000///foo')).toBe(
    'https://sindresorhus.com:5000/foo'
  )
  expect(normalizeUrl('https://sindresorhus.com///foo')).toBe(
    'https://sindresorhus.com/foo'
  )
  expect(normalizeUrl('https://sindresorhus.com:5000//foo')).toBe(
    'https://sindresorhus.com:5000/foo'
  )
  expect(normalizeUrl('https://sindresorhus.com//foo')).toBe(
    'https://sindresorhus.com/foo'
  )
})
