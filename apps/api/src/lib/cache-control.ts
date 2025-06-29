import { assert } from '@agentic/platform-core'

export type PublicCacheControlLevels =
  | '1s'
  | '10s'
  | '30s'
  | '1m'
  | '5m'
  | '10m'
  | '30m'
  | '1h'
  | '1d'

const publicCacheControlLevelsMap: Record<PublicCacheControlLevels, string> = {
  '1s': 'public, max-age=1, s-maxage=1 stale-while-revalidate=0',
  '10s': 'public, max-age=10, s-maxage=10 stale-while-revalidate=1',
  '30s': 'public, max-age=30, s-maxage=30 stale-while-revalidate=5',
  '1m': 'public, max-age=60, s-maxage=60 stale-while-revalidate=10',
  '5m': 'public, max-age=300, s-maxage=300 stale-while-revalidate=60',
  '10m': 'public, max-age=600, s-maxage=600 stale-while-revalidate=120',
  '30m': 'public, max-age=1800, s-maxage=1800 stale-while-revalidate=300',
  '1h': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=500',
  '1d': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=3600'
}

export function setPublicCacheControl(
  res: Response,
  level: PublicCacheControlLevels
) {
  const cacheControl = publicCacheControlLevelsMap[level]
  assert(cacheControl, `Invalid cache control level "${level}"`)

  res.headers.set('cache-control', cacheControl)
}
