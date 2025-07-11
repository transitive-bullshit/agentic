import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { assert, type Logger, parseJson } from '@agentic/platform-core'
import {
  BaseResolver,
  bundle,
  type Config as RedoclyConfig,
  type Document,
  lintDocument,
  makeDocumentFromString,
  type NormalizedProblem,
  Source
} from '@redocly/openapi-core'

import type { DereferencedLooseOpenAPI3Spec, LooseOpenAPI3Spec } from './types'
import { getDefaultRedoclyConfig } from './redocly-config'

interface ParseSchemaOptions {
  absoluteRef: string
  resolver: BaseResolver
}

/**
 * Validates an OpenAPI spec and bundles it into a single, normalized schema.
 *
 * The input `source` should point to a valid OpenAPI spec (3.0 or 3.1).
 *
 * Adapted from https://github.com/openapi-ts/openapi-typescript/blob/main/packages/openapi-typescript/src/lib/redoc.ts
 */
export async function validateOpenAPISpec<
  TDereference extends boolean | undefined
>(
  source: string | URL | Buffer | Record<string, unknown>,
  {
    cwd,
    redoclyConfig,
    logger,
    silent = false,
    dereference = false
  }: {
    cwd?: string
    redoclyConfig?: RedoclyConfig
    logger?: Logger
    silent?: boolean
    dereference?: TDereference
  } = {}
): Promise<
  TDereference extends true ? DereferencedLooseOpenAPI3Spec : LooseOpenAPI3Spec
> {
  if (!redoclyConfig) {
    redoclyConfig = await getDefaultRedoclyConfig()
  }

  if (
    typeof source === 'string' &&
    (source.startsWith('https://') ||
      source.startsWith('http://') ||
      source.startsWith('//'))
  ) {
    try {
      source = new URL(source)
    } catch {
      // Not a URL, continue
    }
  }

  let absoluteRef: string
  if (source instanceof URL) {
    absoluteRef =
      source.protocol === 'file:' ? fileURLToPath(source) : source.href
  } else {
    absoluteRef = cwd ?? process.cwd()
  }

  const resolver = new BaseResolver(redoclyConfig.resolve)
  let document: Document

  try {
    document = await parseSchema(source, {
      absoluteRef,
      resolver
    })
  } catch (err: any) {
    throw new Error(`Invalid OpenAPI spec: ${err.message}`)
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
    doc: document,
    config: redoclyConfig,
    dereference,
    removeUnusedComponents: true,
    externalRefResolver: resolver
  })
  _processProblems(bundled.problems, { silent, logger })

  return bundled.bundle.parsed
}

async function parseSchema(
  schema: unknown,
  { absoluteRef, resolver }: ParseSchemaOptions
): Promise<Document> {
  if (!schema) {
    throw new Error('Invalid schema: empty')
  }

  if (schema instanceof URL) {
    const result = await resolver.resolveDocument(null, absoluteRef, true)

    if ('parsed' in result) {
      const { parsed } = result
      if (typeof parsed === 'object') {
        return result
      } else if (typeof parsed === 'string') {
        // Result is a string that we need to parse down below
        schema = parsed
      } else {
        throw new Error('Invalid OpenAPI spec: failed to parse remote schema')
      }
    } else {
      throw result.originalError
    }
  }

  if (schema instanceof Buffer) {
    return parseSchema(schema.toString('utf8'), { absoluteRef, resolver })
  }

  if (typeof schema === 'string') {
    schema = schema.trim()
    assert(typeof schema === 'string')

    // URL
    if (
      schema.startsWith('http://') ||
      schema.startsWith('https://') ||
      schema.startsWith('file://')
    ) {
      const url = new URL(schema)

      return parseSchema(url, {
        absoluteRef: url.protocol === 'file:' ? fileURLToPath(url) : url.href,
        resolver
      })
    }

    // JSON
    if (schema[0] === '{') {
      return {
        source: new Source(absoluteRef, schema, 'application/json'),
        parsed: parseJson(schema)
      }
    }

    // Path to local file
    // TODO: support raw local files (no ./ prefix)
    if (schema.startsWith('/') || schema.startsWith('.')) {
      const schemaPath = path.join(absoluteRef, schema)
      const schemaContent = await fs.readFile(schemaPath, 'utf8')

      // TODO: support local YAML files
      return {
        source: new Source(schemaPath, schemaContent, 'application/json'),
        parsed: parseJson(schemaContent)
      }
    }

    // YAML
    const result = makeDocumentFromString(schema, absoluteRef)
    if (
      typeof result !== 'object' ||
      !('parsed' in result) ||
      typeof result.parsed !== 'object'
    ) {
      throw new Error('Invalid OpenAPI spec: failed to parse schema')
    }

    return result
  }

  if (typeof schema === 'object' && !Array.isArray(schema)) {
    return {
      source: new Source(
        absoluteRef,
        JSON.stringify(schema),
        'application/json'
      ),
      parsed: schema
    }
  }

  throw new Error(
    `Error parsing OpenAPI spec: Expected string, object, or Buffer. Got ${Array.isArray(schema) ? 'Array' : typeof schema}`
  )
}

function _processProblems(
  problems: NormalizedProblem[],
  {
    logger,
    silent
  }: {
    logger?: Logger
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
        logger?.error('openapi spec error', problemMessage)
      } else if (!silent) {
        logger?.warn('openapi spec warning', problemMessage)
      }
    }

    if (errorMessage) {
      throw new Error(errorMessage)
    }
  }
}
