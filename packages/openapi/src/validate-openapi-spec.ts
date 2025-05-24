import { parseJson } from '@agentic/platform-core'
import {
  BaseResolver,
  bundle,
  type Config as RedoclyConfig,
  createConfig,
  type Document,
  lintDocument,
  type NormalizedProblem,
  Source
} from '@redocly/openapi-core'

import type { Logger, LooseOpenAPI3Spec } from './types'

/**
 * Validates an OpenAPI spec and bundles it into a single, normalized schema.
 *
 * The input `source` should be a JSON stringified OpenAPI spec (3.0 or 3.1).
 *
 * Adapted from https://github.com/openapi-ts/openapi-typescript/blob/main/packages/openapi-typescript/src/lib/redoc.ts
 */
export async function validateOpenAPISpec(
  source: string,
  {
    redoclyConfig,
    logger = console,
    silent = false
  }: {
    redoclyConfig?: RedoclyConfig
    logger?: Logger
    silent?: boolean
  } = {}
): Promise<LooseOpenAPI3Spec> {
  if (!redoclyConfig) {
    redoclyConfig = await createConfig(
      {
        rules: {
          // throw error on duplicate operationIds
          'operation-operationId-unique': { severity: 'error' }
        }
      },
      { extends: ['minimal'] }
    )
  }

  const resolver = new BaseResolver(redoclyConfig.resolve)

  let parsed: any
  try {
    parsed = parseJson(source)
  } catch (err: any) {
    throw new Error(`Invalid OpenAPI spec: ${err.message}`)
  }

  const document: Document = {
    source: new Source('', source, 'application/json'),
    parsed
  }

  // Check for OpenAPI 3 or greater
  const openapiVersion = Number.parseFloat(document.parsed.openapi)
  if (
    document.parsed.swagger ||
    !document.parsed.openapi ||
    Number.isNaN(openapiVersion) ||
    openapiVersion < 3 ||
    openapiVersion >= 4
  ) {
    if (document.parsed.swagger) {
      throw new Error(
        'Unsupported Swagger version: 2.x. Use OpenAPI 3.x instead.'
      )
    }

    if (document.parsed.openapi || openapiVersion < 3 || openapiVersion >= 4) {
      throw new Error(`Unsupported OpenAPI version: ${document.parsed.openapi}`)
    }

    throw new Error('Unsupported schema format, expected `openapi: 3.x`')
  }

  const problems = await lintDocument({
    document,
    config: redoclyConfig.styleguide,
    externalRefResolver: resolver
  })
  _processProblems(problems, { silent, logger })

  const bundled = await bundle({
    config: redoclyConfig,
    dereference: false,
    doc: document
  })
  _processProblems(bundled.problems, { silent, logger })

  return bundled.bundle.parsed
}

function _processProblems(
  problems: NormalizedProblem[],
  {
    logger,
    silent
  }: {
    logger: Logger
    silent: boolean
  }
) {
  if (problems.length) {
    let errorMessage: string | undefined

    for (const problem of problems) {
      const problemLocation = problem.location?.[0]?.pointer
      const problemMessage = problemLocation
        ? `${problem.message} at ${problemLocation}`
        : problem.message

      if (problem.severity === 'error') {
        errorMessage = problemMessage
        logger.error('openapi spec error', problemMessage)
      } else if (!silent) {
        logger.warn('openapi spec warning', problemMessage)
      }
    }

    if (errorMessage) {
      throw new Error(errorMessage)
    }
  }
}
