import isRelativeUrlImpl from 'is-relative-url'
import normalizeUrlImpl, { type Options } from 'normalize-url'
import QuickLRU from 'quick-lru'

import { hashObject } from './utils.js'

const protocolAllowList = new Set(['https:', 'http:'])
const normalizedUrlCache = new QuickLRU<string, string | undefined>({
  maxSize: 4000
})

/**
 * Checks if a URL is crawlable.
 *
 * @param url - URL string to check
 * @returns whether the URL is crawlable
 */
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

/**
 * Normalizes a URL string.
 *
 * @param url - URL string to normalize
 * @param options - options for normalization.
 * @returns normalized URL string or null if an invalid URL was passed
 */
export function normalizeUrl(
  url: string,
  options?: Options
): string | undefined {
  let normalizedUrl: string | undefined
  let cacheKey: string | undefined

  try {
    if (!url || isRelativeUrl(url)) {
      return
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
    } as Required<Options>

    const optionsHash = hashObject(opts)
    cacheKey = `${url}-${optionsHash}`
    normalizedUrl = normalizedUrlCache.get(cacheKey)

    if (normalizedUrl !== undefined) {
      return normalizedUrl
    }

    normalizedUrl = normalizeUrlImpl(url, opts)
  } catch {
    // ignore invalid urls
    normalizedUrl = undefined
  }

  if (cacheKey) {
    normalizedUrlCache.set(cacheKey, normalizedUrl!)
  }

  return normalizedUrl
}
