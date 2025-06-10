export function isCacheControlPubliclyCacheable(
  cacheControl?: string | null
): boolean {
  if (!cacheControl) {
    return false
  }

  const directives = new Set(cacheControl.split(',').map((s) => s.trim()))
  if (
    directives.has('no-store') ||
    directives.has('no-cache') ||
    directives.has('private') ||
    !directives.has('public')
  ) {
    return false
  }

  return true
}
