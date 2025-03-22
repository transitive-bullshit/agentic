/* eslint-disable no-template-curly-in-string */
import * as fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import type { IJsonSchema, OpenAPIV3 } from 'openapi-types'
import { assert } from '@agentic/core'
import SwaggerParser from '@apidevtools/swagger-parser'
import camelCase from 'camelcase'
import decamelize from 'decamelize'
import { execa } from 'execa'

import { convertParametersToJSONSchema } from './openapi-parameters-to-json-schema'
import {
  dereference,
  dereferenceFull,
  getAndResolve,
  getComponentName,
  getOperationParamsName,
  getOperationResponseName,
  jsonSchemaToZod,
  prettify
} from './utils'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const jsonContentType = 'application/json'
const multipartFormData = 'multipart/form-data'

const httpMethods = [
  'get',
  'post',
  'put',
  'delete',
  'options',
  'head',
  'patch',
  'trace'
] as const

async function main() {
  const pathToOpenApiSpec = process.argv[2]
  assert(pathToOpenApiSpec, 'Missing path to OpenAPI spec')

  const parser = new SwaggerParser()
  const spec = (await parser.bundle(pathToOpenApiSpec)) as OpenAPIV3.Document
  // | OpenAPIV3_1.Document

  if (
    // TODO: make this less brittle
    spec.openapi !== '3.0.0' &&
    spec.openapi !== '3.1.0' &&
    spec.openapi !== '3.1.1'
  ) {
    throw new Error(`Unexpected OpenAPI version "${spec.openapi}"`)
  }

  const openapiSpecName = path.basename(pathToOpenApiSpec, '.json')
  assert(
    openapiSpecName.toLowerCase() === openapiSpecName,
    `OpenAPI spec name "${openapiSpecName}" must be in kebab case`
  )
  const name = camelCase(openapiSpecName, { pascalCase: true })
  const nameLowerCase = name.toLowerCase()
  const nameSnakeCase = decamelize(name)
  const nameKebabCase = decamelize(name, { separator: '-' })
  const nameUpperCase = nameSnakeCase.toUpperCase()
  const clientName = `${name}Client`
  const namespaceName = nameLowerCase
  // const destFolder = path.join('packages', nameKebabCase)
  // const destFolderSrc = path.join(destFolder, 'src')

  const destFolder = path.join(dirname, '..', 'fixtures', 'generated')
  const destFileClient = path.join(destFolder, `${nameKebabCase}-client.ts`)

  const apiBaseUrl = spec.servers?.[0]?.url

  const securitySchemes = spec.components?.securitySchemes
  const resolvedSecuritySchemes: Record<
    string,
    OpenAPIV3.SecuritySchemeObject
  > = {}
  const apiKeyHeaderNames: string[] = []

  if (securitySchemes) {
    for (const [securitySchemaName, maybeSecuritySchema] of Object.entries(
      securitySchemes
    )) {
      const securitySchema = dereferenceFull(maybeSecuritySchema, parser.$refs)
      if (!securitySchema) continue

      resolvedSecuritySchemes[securitySchemaName] = securitySchema

      switch (securitySchema.type) {
        case 'apiKey':
          apiKeyHeaderNames.push(securitySchemaName)
          break

        case 'http':
          if (securitySchema.scheme === 'bearer') {
            apiKeyHeaderNames.push(securitySchemaName)
          }
          break

        case 'oauth2':
          apiKeyHeaderNames.push(securitySchemaName)
          break

        default:
          console.log(
            'unsupported security schema',
            securitySchemaName,
            securitySchema
          )
      }
    }
  }

  const hasGlobalApiKeyInHeader = apiKeyHeaderNames.length === 1
  const componentsToProcess = new Set<string>()

  const requestBodyJSONSchemaPaths = [
    'requestBody',
    'content',
    jsonContentType,
    'schema'
  ]

  const requestBodyFormDataJSONSchemaPaths = [
    'requestBody',
    'content',
    multipartFormData,
    'schema'
  ]

  const operationResponsePaths = [
    ['responses', '200', 'content', jsonContentType, 'schema'],
    ['responses', '201', 'content', jsonContentType, 'schema']
    // ['responses', 'default', 'content', jsonContentType, 'schema']
  ]

  const operationRequestPaths = [
    requestBodyJSONSchemaPaths,
    requestBodyFormDataJSONSchemaPaths
  ]

  const operationIds = new Set<string>()
  const operationSchemas: Record<string, string> = {}
  const componentSchemas: Record<string, string> = {}
  const aiClientMethods: string[] = []

  for (const path in spec.paths) {
    const pathItem = spec.paths[path]
    assert(pathItem)
    // console.log(JSON.stringify(pathItem, null, 2))

    for (const method of httpMethods) {
      const operation = pathItem[method]
      if (!operation) {
        continue
      }

      if (method === 'trace' || method === 'options') {
        continue
      }

      const operationName =
        // TODO: better camelCase fallback
        operation.operationId || `${method}${path.replaceAll(/\W+/g, '_')}`
      assert(
        operationName,
        `Invalid operation name ${operationName} for path "${method} ${path}"`
      )
      assert(
        !operationIds.has(operationName),
        `Duplicate operation name "${operationName}"`
      )
      operationIds.add(operationName)
      const operationNameSnakeCase = decamelize(operationName)

      // if (path !== '/crawl/status/{jobId}') continue
      // if (path !== '/pets' || method !== 'post') continue
      // console.log(method, path, operationName)

      const operationParamsJSONSchema = {
        type: 'object',
        properties: {} as Record<string, any>,
        required: [] as string[],
        $refs: [] as string[]
      }

      const operationResponseJSONSchemas: Record<string, IJsonSchema> = {}

      const operationParamsSources: Record<string, string> = {}

      // eslint-disable-next-line unicorn/consistent-function-scoping
      function addJSONSchemaParams(schema: IJsonSchema, source: string) {
        dereferenceFull(schema, parser.$refs, componentsToProcess)

        if (schema.$ref) {
          operationParamsJSONSchema.$refs.push(schema.$ref)

          const derefed = dereference(schema, parser.$refs, componentsToProcess)
          if (derefed?.properties) {
            for (const key of Object.keys(derefed.properties)) {
              assert(
                !operationParamsSources[key],
                `Duplicate params key ${key} for operation ${operationName} from ${operationParamsSources[key]} and ${source}`
              )
              operationParamsSources[key] = source
            }
          }
        } else {
          assert(schema.type === 'object')

          if (schema.properties) {
            operationParamsJSONSchema.properties = {
              ...operationParamsJSONSchema.properties,
              ...schema.properties
            }

            for (const key of Object.keys(schema.properties)) {
              assert(
                !operationParamsSources[key],
                `Duplicate params key ${key} for operation ${operationName} from ${operationParamsSources[key]} and ${source}`
              )
              operationParamsSources[key] = source
            }
          }

          if (schema.required) {
            operationParamsJSONSchema.required = [
              ...operationParamsJSONSchema.required,
              ...schema.required
            ]
          }
        }
      }

      // eslint-disable-next-line unicorn/consistent-function-scoping
      function addJSONSchemaResponse(schema: IJsonSchema, status: string) {
        dereferenceFull(schema, parser.$refs, componentsToProcess)
        operationResponseJSONSchemas[status] = schema
      }

      for (const schemaPath of operationRequestPaths) {
        const res = getAndResolve(
          operation,
          schemaPath,
          parser.$refs,
          componentsToProcess
        )

        if (res) {
          addJSONSchemaParams(
            res,
            schemaPath[2] === jsonContentType ? 'body' : 'formData'
          )
          break
        }
      }

      for (const schemaPath of operationResponsePaths) {
        const res = getAndResolve(
          operation,
          schemaPath,
          parser.$refs,
          componentsToProcess
        )

        if (res) {
          const status = schemaPath[1]!
          assert(
            status,
            `Invalid status ${status} for operation ${operationName}`
          )

          addJSONSchemaResponse(res, status)
          break
        }
      }

      if (operation.parameters) {
        const params = convertParametersToJSONSchema(operation.parameters)

        if (params.body) {
          addJSONSchemaParams(params.body, 'body')
        }

        if (params.formData) {
          addJSONSchemaParams(params.formData, 'formData')
        }

        if (params.headers) {
          addJSONSchemaParams(params.headers, 'formData')
        }

        if (params.path) {
          addJSONSchemaParams(params.path, 'path')
        }

        if (params.query) {
          addJSONSchemaParams(params.query, 'query')
        }
      }

      const operationParamsName = getOperationParamsName(
        operationName,
        componentSchemas
      )
      const operationResponseName = getOperationResponseName(operationName)

      {
        // Merge all operations params into one schema declaration
        let operationsParamsSchema = jsonSchemaToZod(
          operationParamsJSONSchema,
          { name: `${operationParamsName}Schema`, type: operationParamsName }
        )

        if (operationParamsJSONSchema.$refs.length) {
          const refSchemas = operationParamsJSONSchema.$refs.map(
            (ref) => `${getComponentName(ref)!}Schema`
          )

          operationsParamsSchema = operationsParamsSchema.replace(
            // eslint-disable-next-line security/detect-non-literal-regexp
            new RegExp(`(${operationParamsName}Schema = .*)$`, 'm'),
            // eslint-disable-next-line unicorn/no-array-reduce
            refSchemas.reduce(
              (acc, refSchema) => `${acc}.merge(${refSchema})`,
              '$1'
            )
          )
        }

        assert(
          !componentSchemas[operationParamsName],
          `Operation params name "${operationParamsName}" conflicts with component name`
        )
        operationSchemas[operationParamsName] = operationsParamsSchema
      }

      const operationResponseJSONSchema = operationResponseJSONSchemas['200']
      if (operationResponseJSONSchema) {
        let isDuplicateDefinition = false

        if (operationResponseJSONSchema.$ref) {
          const componentName = getComponentName(
            operationResponseJSONSchema.$ref
          )
          if (componentName === operationResponseName) {
            isDuplicateDefinition = true
          }
        }

        if (!isDuplicateDefinition) {
          const operationResponseSchema = jsonSchemaToZod(
            operationResponseJSONSchema,
            {
              name: `${operationResponseName}Schema`,
              type: operationResponseName
            }
          )

          assert(
            !componentSchemas[operationResponseName],
            `Operation response name "${operationResponseName}" conflicts with component name`
          )
          operationSchemas[operationResponseName] = operationResponseSchema
        }
      } else {
        assert(
          !componentSchemas[operationResponseName],
          `Operation response name "${operationResponseName}" conflicts with component name`
        )
        operationSchemas[operationResponseName] =
          `export type ${operationResponseName} = undefined\n`
      }

      // console.log(
      //   JSON.stringify(
      //     {
      //       operationName,
      //       operationParamsSources,
      //       operationParamsJSONSchema
      //     },
      //     null,
      //     2
      //   )
      // )

      const queryParams = Object.keys(operationParamsSources).filter(
        (key) => operationParamsSources[key] === 'query'
      )
      const hasQueryParams = queryParams.length > 0

      const bodyParams = Object.keys(operationParamsSources).filter(
        (key) => operationParamsSources[key] === 'body'
      )
      const hasBodyParams = bodyParams.length > 0

      const formDataParams = Object.keys(operationParamsSources).filter(
        (key) => operationParamsSources[key] === 'formData'
      )
      const hasFormDataParams = formDataParams.length > 0

      const pathParams = Object.keys(operationParamsSources).filter(
        (key) => operationParamsSources[key] === 'path'
      )
      const hasPathParams = pathParams.length > 0

      const headersParams = Object.keys(operationParamsSources).filter(
        (key) => operationParamsSources[key] === 'headers'
      )
      const hasHeadersParams = headersParams.length > 0

      const onlyHasOneParamsSource =
        new Set(Object.values(operationParamsSources)).size === 1
      const onlyHasPathParams = hasPathParams && onlyHasOneParamsSource

      const pathTemplate = hasPathParams
        ? '`' + path.replaceAll(/{([^}]+)}/g, '${params["$1"]}') + '`'
        : `'${path}'`

      let description = operation.description || operation.summary
      if (description && !/[!.?]$/.test(description)) {
        description += '.'
      }

      const aiClientMethod = `
        ${description ? `/**\n * ${description}\n */` : ''}
        @aiFunction({
          name: '${operationNameSnakeCase}',
          ${description ? `description: '${description}',` : ''}
          inputSchema: ${namespaceName}.${operationParamsName}Schema,
        })
        async ${operationName}(params: ${namespaceName}.${operationParamsName}): Promise<${namespaceName}.${operationResponseName}> {
          return this.ky.${method}(${pathTemplate}${
            onlyHasPathParams
              ? ''
              : `, {
            ${hasQueryParams ? (onlyHasOneParamsSource ? `searchParams: sanitizeSearchParams(params),` : `searchParams: sanitizeSearchParams(pick(params, '${queryParams.join("', '")}')),`) : ''}
            ${hasBodyParams ? (onlyHasOneParamsSource ? `json: params,` : `json: pick(params, '${bodyParams.join("', '")}'),`) : ''}
            ${hasFormDataParams ? (onlyHasOneParamsSource ? `form: params,` : `form: pick(params, '${formDataParams.join("', '")}'),`) : ''}
            ${hasHeadersParams ? (onlyHasOneParamsSource ? `headers: params,` : `headers: pick(params, '${headersParams.join("', '")}'),`) : ''}
          }`
          }).json<${namespaceName}.${operationResponseName}>()
        }
      `

      aiClientMethods.push(aiClientMethod)
    }
  }

  const processedComponents = new Set<string>()
  const componentToRefs: Record<
    string,
    { dereferenced: any; refs: Set<string> }
  > = {}

  for (const ref of componentsToProcess) {
    const component = parser.$refs.get(ref)
    assert(component)

    const resolved = new Set<string>()
    const dereferenced = dereference(component, parser.$refs)
    dereference(component, parser.$refs, resolved, 0, Number.POSITIVE_INFINITY)
    assert(dereferenced)

    for (const ref of resolved) {
      assert(componentsToProcess.has(ref))
    }

    componentToRefs[ref] = { dereferenced, refs: resolved }
  }

  const sortedComponents = Object.keys(componentToRefs).sort(
    (a, b) => componentToRefs[a]!.refs.size - componentToRefs[b]!.refs.size
  )

  for (const ref of sortedComponents) {
    const type = getComponentName(ref)
    assert(type, `Invalid ref name ${ref}`)

    const name = `${type}Schema`

    const { dereferenced, refs } = componentToRefs[ref]!
    if (processedComponents.has(ref)) {
      continue
    }

    for (const r of refs) {
      if (processedComponents.has(r)) {
        continue
      }

      processedComponents.add(r)
    }

    processedComponents.add(ref)

    const schema = jsonSchemaToZod(dereferenced, { name, type })
    componentSchemas[type] = schema

    // console.log(ref, name, dereferenced)
  }

  // console.log(
  //   '\ncomponents',
  //   Array.from(componentsToProcess)
  //     .map((ref) => getComponentName(ref))
  //     .sort()
  // )

  // console.log(
  //   '\nmodels',
  //   Object.fromEntries(
  //     await Promise.all(
  //       Object.entries(schemaInput).map(async ([key, value]) => {
  //         return [key, await prettify(value)]
  //       })
  //     )
  //   )
  // )

  const aiClientMethodsString = aiClientMethods.join('\n\n')

  const header = `
/**
 * This file was auto-generated from an OpenAPI spec.
 */

import {
  AIFunctionsProvider,
  ${aiClientMethods.length > 0 ? 'aiFunction,' : ''}
  ${hasGlobalApiKeyInHeader ? 'assert,' : ''}
  ${hasGlobalApiKeyInHeader ? 'getEnv,' : ''}
  ${aiClientMethodsString.includes('pick(') ? 'pick,' : ''}
  ${aiClientMethodsString.includes('sanitizeSearchParams(') ? 'sanitizeSearchParams,' : ''}
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'`.trim()

  const outputTypes = (
    await prettify(
      [
        header,
        `export namespace ${namespaceName} {`,
        apiBaseUrl ? `export const apiBaseUrl = '${apiBaseUrl}'` : undefined,
        ...Object.values(componentSchemas),
        ...Object.values(operationSchemas),
        '}'
      ]
        .filter(Boolean)
        .join('\n\n')
    )
  )
    .replaceAll(/z\.object\({}\)\.merge\(([^)]*)\)/g, '$1')
    .replaceAll(/\/\*\*(\S.*)\*\//g, '/** $1 */')

  const output = await prettify(
    [
      outputTypes,
      `
export class ${clientName} extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  ${hasGlobalApiKeyInHeader ? 'protected readonly apiKey: string' : ''}
  protected readonly apiBaseUrl: string

  constructor({
    ${hasGlobalApiKeyInHeader ? `apiKey = getEnv('${nameUpperCase}_API_KEY'),` : ''}
    apiBaseUrl${apiBaseUrl ? ` = ${namespaceName}.apiBaseUrl` : ''},
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    ${
      hasGlobalApiKeyInHeader
        ? `assert(
      apiKey,
      '${clientName} missing required "apiKey" (defaults to "${nameUpperCase}_API_KEY")'
    )`
        : ''
    }
    super()

    ${hasGlobalApiKeyInHeader ? `this.apiKey = apiKey` : ''}
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl,
      ${
        hasGlobalApiKeyInHeader
          ? `headers: {
        ${apiKeyHeaderNames.map((name) => `'${(resolvedSecuritySchemes[name] as any).name || 'Authorization'}': ${(resolvedSecuritySchemes[name] as any).schema?.toLowerCase() === 'bearer' ? '`Bearer ${apiKey}`' : 'apiKey'}`).join(',\n')}
      },`
          : ''
      }
    })
  }
`,
      aiClientMethodsString,
      '}'
    ].join('\n\n')
  )

  // console.log(output)
  await fs.mkdir(destFolder, { recursive: true })
  await fs.writeFile(destFileClient, output)
  await execa('npx', ['eslint', '--fix', destFileClient])
}

await main()
