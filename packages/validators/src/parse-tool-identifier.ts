import type { ParsedToolIdentifier, ParseIdentifierOptions } from './types'
import { coerceIdentifier } from './utils'

const toolIdentifierImplicitRe =
  /^@([a-z0-9-]{1,256})\/([a-z0-9-]{1,256})\/([a-zA-Z_][a-zA-Z0-9_]{0,63})$/

const toolIdentifierHashRe =
  /^@([a-z0-9-]{1,256})\/([a-z0-9-]{1,256})@([a-z0-9]{8})\/([a-zA-Z_][a-zA-Z0-9_]{0,63})$/

const toolIdentifierVersionRe =
  /^@([a-z0-9-]{1,256})\/([a-z0-9-]{1,256})@([\d.a-z-@]+)\/([a-zA-Z_][a-zA-Z0-9_]{0,63})$/

export function parseToolIdentifier(
  identifier?: string,
  { strict = true }: ParseIdentifierOptions = {}
): ParsedToolIdentifier | undefined {
  if (!strict) {
    identifier = coerceIdentifier(identifier)
  }

  if (!identifier?.length) {
    return
  }

  const iMatch = identifier.match(toolIdentifierImplicitRe)

  if (iMatch) {
    return {
      projectIdentifier: `@${iMatch[1]!}/${iMatch[2]!}`,
      projectNamespace: iMatch[1]!,
      projectName: iMatch[2]!,
      deploymentIdentifier: `@${iMatch[1]!}/${iMatch[2]!}@latest`,
      deploymentVersion: 'latest',
      toolName: iMatch[3]!
    }
  }

  const hMatch = identifier.match(toolIdentifierHashRe)

  if (hMatch) {
    return {
      projectIdentifier: `@${hMatch[1]!}/${hMatch[2]!}`,
      projectNamespace: hMatch[1]!,
      projectName: hMatch[2]!,
      deploymentIdentifier: `@${hMatch[1]!}/${hMatch[2]!}@${hMatch[3]!}`,
      deploymentHash: hMatch[3]!,
      toolName: hMatch[4]!
    }
  }

  const vMatch = identifier.match(toolIdentifierVersionRe)

  if (vMatch) {
    return {
      projectIdentifier: `@${vMatch[1]!}/${vMatch[2]!}`,
      projectNamespace: vMatch[1]!,
      projectName: vMatch[2]!,
      deploymentIdentifier: `@${vMatch[1]!}/${vMatch[2]!}@${vMatch[3]!}`,
      deploymentVersion: 'latest',
      toolName: vMatch[4]!
    }
  }
}
