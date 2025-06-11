export function isRequestPubliclyCacheable(request: Request): boolean {
  const pragma = request.headers.get('pragma')
  if (pragma === 'no-cache') {
    return false
  }

  return isCacheControlPubliclyCacheable(request.headers.get('cache-control'))
}

export function isResponsePubliclyCacheable(response: Response): boolean {
  const pragma = response.headers.get('pragma')
  if (pragma === 'no-cache') {
    return false
  }

  return isCacheControlPubliclyCacheable(response.headers.get('cache-control'))
}

export function isCacheControlPubliclyCacheable(
  cacheControl?: string | null
): boolean {
  if (!cacheControl) {
    // TODO: should we default to true or false?
    return true
  }

  const directives = new Set(cacheControl.split(',').map((s) => s.trim()))
  if (
    directives.has('no-store') ||
    directives.has('no-cache') ||
    directives.has('private') ||
    directives.has('max-age=0')
  ) {
    return false
  }

  return true
}
