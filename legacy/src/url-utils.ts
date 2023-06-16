import isRelativeUrl from 'is-relative-url'
import normalizeUrlImpl, { type Options } from 'normalize-url'
import QuickLRU from 'quick-lru'

// const protocolAllowList = new Set(['https:', 'http:'])
const normalizedUrlCache = new QuickLRU<string, string | null>({
  maxSize: 4000
})

export function normalizeUrl(url: string, options?: Options): string | null {
  let normalizedUrl: string | null | undefined

  try {
    if (!url || (isRelativeUrl(url) && !url.startsWith('//'))) {
      return null
    }

    // TODO: caching doesn't take into account `options`
    normalizedUrl = normalizedUrlCache.get(url)

    if (normalizedUrl !== undefined) {
      return normalizedUrl
    }

    normalizedUrl = normalizeUrlImpl(url, {
      stripWWW: false,
      defaultProtocol: 'https',
      normalizeProtocol: true,
      forceHttps: false,
      stripHash: false,
      stripTextFragment: true,
      removeQueryParameters: [/^utm_\w+/i, 'ref', 'ref_src'],
      removeTrailingSlash: true,
      removeSingleSlash: true,
      removeExplicitPort: true,
      sortQueryParameters: true,
      ...options
    })
  } catch (err) {
    // ignore invalid urls
    normalizedUrl = null
  }

  normalizedUrlCache.set(url, normalizedUrl!)
  return normalizedUrl
}
