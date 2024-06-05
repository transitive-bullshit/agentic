import isRelativeUrlImpl from 'is-relative-url'
import normalizeUrlImpl, {
  type Options as NormalizeUrlOptions
} from 'normalize-url'
import QuickLRU from 'quick-lru'

import { hashObject } from './utils.js'

const protocolAllowList = new Set(['https:', 'http:'])
const normalizedUrlCache = new QuickLRU<string, string | null>({
  maxSize: 4000
})

export function isValidCrawlableUrl(url: string): boolean {
  try {
    if (!url || isRelativeUrl(url)) {
      return false
    }

    const parsedUrl = new URL(url)
    if (!protocolAllowList.has(parsedUrl.protocol)) {
      return false
    }

    const normalizedUrl = normalizeUrl(url)
    if (!normalizedUrl) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export function isRelativeUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false

  return isRelativeUrlImpl(url) && !url.startsWith('//')
}

export function normalizeUrl(
  url: string,
  options?: NormalizeUrlOptions
): string | null {
  let normalizedUrl: string | null | undefined

  if (!url || isRelativeUrl(url)) {
    return null
  }

  const opts = {
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
  } as Required<NormalizeUrlOptions>

  const optionsHash = hashObject(opts)
  const cacheKey = `${url}-${optionsHash}`

  try {
    normalizedUrl = normalizedUrlCache.get(cacheKey)

    if (normalizedUrl !== undefined) {
      return normalizedUrl
    }

    normalizedUrl = normalizeUrlImpl(url, opts)
    if (!normalizeUrl) {
      normalizedUrl = null
    }
  } catch {
    // ignore invalid urls
    normalizedUrl = null
  }

  normalizedUrlCache.set(cacheKey, normalizedUrl!)
  return normalizedUrl
}
