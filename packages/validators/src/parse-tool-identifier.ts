import type { ParsedToolIdentifier } from './types'
import { parseToolUri } from './parse-tool-uri'

export function parseToolIdentifier(
  identifier: string
  // { namespace }: { namespace?: string } = {}
): ParsedToolIdentifier | undefined {
  if (!identifier) {
    return
  }

  let uri = identifier
  try {
    const { pathname } = new URL(identifier)
    uri = pathname
  } catch {}

  uri = uri.replaceAll(/^\//g, '')
  uri = uri.replaceAll(/\/$/g, '')

  if (!uri.length) {
    return
  }

  // const hasNamespacePrefix = /^([a-zA-Z0-9-]{1,64}\/)/.test(uri)

  // if (!hasNamespacePrefix) {
  //   if (namespace) {
  //     // add inferred namespace prefix (defaults to authenticated user's username)
  //     uri = `${namespace}/${uri}`
  //   } else {
  //     // throw new Error(`FaaS identifier is missing namespace prefix or you must be authenticated [${uri}]`)
  //     return
  //   }
  // }

  return parseToolUri(uri)
}
