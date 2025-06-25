import { HttpError } from '@agentic/platform-core'

import type {
  ParsedDeploymentIdentifier,
  ParseIdentifierOptions
} from './types'
import { parseToolIdentifier } from './parse-tool-identifier'
import { coerceIdentifier } from './utils'

const deploymentIdentifierImplicitRe =
  /^@([a-z0-9-]{1,256})\/([a-z0-9-]{1,256})$/

const deploymentIdentifierHashRe =
  /^@([a-z0-9-]{1,256})\/([a-z0-9-]{1,256})@([a-z0-9]{8})$/

const deploymentIdentifierVersionRe =
  /^@([a-z0-9-]{1,256})\/([a-z0-9-]{1,256})@([\d.a-z-@]+)$/

export function parseDeploymentIdentifier(
  identifier?: string,
  { strict = true, errorStatusCode = 400 }: ParseIdentifierOptions = {}
): ParsedDeploymentIdentifier {
  const inputIdentifier = identifier

  if (!strict) {
    try {
      return parseToolIdentifier(identifier, {
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
      message: `Invalid deployment identifier "${inputIdentifier}"`
    })
  }

  const iMatch = identifier.match(deploymentIdentifierImplicitRe)

  if (iMatch) {
    return {
      projectIdentifier: `@${iMatch[1]!}/${iMatch[2]!}`,
      projectNamespace: iMatch[1]!,
      projectName: iMatch[2]!,
      deploymentIdentifier: `@${iMatch[1]!}/${iMatch[2]!}@latest`,
      deploymentVersion: 'latest'
    }
  }

  const hMatch = identifier.match(deploymentIdentifierHashRe)

  if (hMatch) {
    return {
      projectIdentifier: `@${hMatch[1]!}/${hMatch[2]!}`,
      projectNamespace: hMatch[1]!,
      projectName: hMatch[2]!,
      deploymentIdentifier: `@${hMatch[1]!}/${hMatch[2]!}@${hMatch[3]!}`,
      deploymentHash: hMatch[3]!
    }
  }

  const vMatch = identifier.match(deploymentIdentifierVersionRe)

  if (vMatch) {
    return {
      projectIdentifier: `@${vMatch[1]!}/${vMatch[2]!}`,
      projectNamespace: vMatch[1]!,
      projectName: vMatch[2]!,
      deploymentIdentifier: `@${vMatch[1]!}/${vMatch[2]!}@${vMatch[3]!}`,
      deploymentVersion: vMatch[3]!
    }
  }

  throw new HttpError({
    statusCode: errorStatusCode,
    message: `Invalid deployment identifier "${inputIdentifier}"`
  })
}
