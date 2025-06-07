import type { ParsedProjectIdentifier, ParseIdentifierOptions } from './types'
import { parseDeploymentIdentifier } from './parse-deployment-identifier'
import { coerceIdentifier } from './utils'

const projectIdentifierRe = /^@([a-z0-9-]{1,256})\/([a-z0-9-]{1,256})$/

export function parseProjectIdentifier(
  identifier?: string,
  { strict = true }: ParseIdentifierOptions = {}
): ParsedProjectIdentifier | undefined {
  if (!strict) {
    const parsedToolIdentifier = parseDeploymentIdentifier(identifier, {
      strict
    })

    if (parsedToolIdentifier) {
      return parsedToolIdentifier
    }
  }

  if (!strict) {
    identifier = coerceIdentifier(identifier)
  }

  if (!identifier?.length) {
    return
  }

  const match = identifier.match(projectIdentifierRe)

  if (match) {
    return {
      projectIdentifier: `@${match[1]!}/${match[2]!}`,
      projectNamespace: match[1]!,
      projectName: match[2]!
    }
  }
}
