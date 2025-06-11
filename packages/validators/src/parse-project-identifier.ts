import { HttpError } from '@agentic/platform-core'

import type { ParsedProjectIdentifier, ParseIdentifierOptions } from './types'
import { parseDeploymentIdentifier } from './parse-deployment-identifier'
import { coerceIdentifier } from './utils'

const projectIdentifierRe = /^@([a-z0-9-]{1,256})\/([a-z0-9-]{1,256})$/

export function parseProjectIdentifier(
  identifier?: string,
  { strict = true, errorStatusCode = 400 }: ParseIdentifierOptions = {}
): ParsedProjectIdentifier {
  const inputIdentifier = identifier

  if (!strict) {
    try {
      return parseDeploymentIdentifier(identifier, {
        strict,
        errorStatusCode
      })
    } catch {
      // ignore
    }
  }

  if (!strict) {
    identifier = coerceIdentifier(identifier)
  }

  if (!identifier?.length) {
    throw new HttpError({
      statusCode: errorStatusCode,
      message: `Invalid project identifier "${inputIdentifier}"`
    })
  }

  const match = identifier.match(projectIdentifierRe)

  if (match) {
    return {
      projectIdentifier: `@${match[1]!}/${match[2]!}`,
      projectNamespace: match[1]!,
      projectName: match[2]!
    }
  }

  throw new HttpError({
    statusCode: errorStatusCode,
    message: `Invalid project identifier "${inputIdentifier}"`
  })
}
