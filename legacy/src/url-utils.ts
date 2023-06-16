import isRelativeUrl from 'is-relative-url'
import normalizeUrlImpl, { type Options } from 'normalize-url'
import QuickLRU from 'quick-lru'

const protocolAllowList = new Set(['https:', 'http:'])
const normalizedUrlCache = new QuickLRU<string, string | null>({
  maxSize: 4000
})

export function isValidCrawlableUrl(url: string): boolean {
  try {
    if (!url || (isRelativeUrl(url) && !url.startsWith('//'))) {
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
  } catch (err) {
    return false
  }
}

/**
 * Generates a hash string from normalization options.
 *
 * The hash string is used as a key in the normalized URL cache to avoid re-normalizing the same URL multiple times. The function assumes that the full options object is passed, not just a subset of options.
 *
 *
 * @param options - normalization options object
 * @returns hash string representing the options
 */
function hashCustomOptions(options: Required<Options>): string {
  let hashString = ''

  // Sort keys to ensure the same hash for identical options regardless of their order:
  const keys = Object.keys(options).sort()

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    let value = options[key]

    if (Array.isArray(value)) {
      value = value.map((v) => v.toString()).join(',') // sufficient for RegExp and string arrays
    } else if (typeof value === 'boolean') {
      value = value ? 'T' : 'F'
    }

    hashString += `${i}:${value},`
  }

  return hashString
}

/**
 * Normalizes a URL string.
 *
 * @param url - URL string to normalize
 * @param options - options for normalization.
 * @returns normalized URL string or null if an invalid URL was passed
 */
export function normalizeUrl(url: string, options?: Options): string | null {
  let normalizedUrl: string | null | undefined

  let cacheKey
  try {
    if (!url || (isRelativeUrl(url) && !url.startsWith('//'))) {
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
    } as Required<Options>
    const optionsHash = hashCustomOptions(opts)
    cacheKey = `${url}-${optionsHash}`
    normalizedUrl = normalizedUrlCache.get(cacheKey)

    if (normalizedUrl !== undefined) {
      return normalizedUrl
    }

    normalizedUrl = normalizeUrlImpl(url, opts)
  } catch (err) {
    // ignore invalid urls
    normalizedUrl = null
  }

  normalizedUrlCache.set(cacheKey, normalizedUrl!)
  return normalizedUrl
}
