import type { ParsedFaasIdentifier } from './types'
import { parseFaasUri } from './parse-faas-uri'

export function parseFaasIdentifier(
  identifier: string,
  { namespace }: { namespace?: string } = {}
): ParsedFaasIdentifier | undefined {
  if (!identifier) {
    return
  }

  let uri = identifier
  try {
    const { pathname } = new URL(identifier)
    uri = pathname
  } catch {}

  if (uri.startsWith('/')) {
    uri = uri.slice(1)
  }

  if (uri.endsWith('/')) {
    uri = uri.slice(0, -1)
  }

  if (!uri.length) {
    return
  }

  const hasNamespacePrefix = /^([a-zA-Z0-9-]{1,64}\/)/.test(uri)

  if (!hasNamespacePrefix) {
    if (namespace) {
      // add inferred namespace prefix (defaults to authenticated user's username)
      uri = `${namespace}/${uri}`
    } else {
      // throw new Error(`FaaS identifier is missing namespace prefix or you must be authenticated [${uri}]`)
      return
    }
  }

  return parseFaasUri(uri)
}
