export function coerceIdentifier(identifier?: string): string | undefined {
  if (!identifier) {
    return
  }

  try {
    const { pathname } = new URL(identifier)
    identifier = pathname
  } catch {}

  identifier = identifier.replace(/^\//, '')
  identifier = identifier.replace(/\/$/, '')

  return identifier
}
