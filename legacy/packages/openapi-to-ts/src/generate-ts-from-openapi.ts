/* eslint-disable no-template-curly-in-string */
import * as fs from 'node:fs/promises'
import path from 'node:path'

import type { IJsonSchema, OpenAPIV3 } from 'openapi-types'
import { assert } from '@agentic/core'
import SwaggerParser from '@apidevtools/swagger-parser'
import decamelize from 'decamelize'
import { execa } from 'execa'

import type { GenerateTSFromOpenAPIOptions } from './types'
import { convertParametersToJSONSchema } from './openapi-parameters-to-json-schema'
import {
  camelCase,
  dereference,
  dereferenceFull,
  getAndResolve,
  getComponentDisplayName,
  getDescription,
  getOperationParamsName,
  getOperationResponseName,
  jsonSchemaToZod,
  naiveMergeJSONSchemas,
  pascalCase,
  prettify
} from './utils'

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

export async function generateTSFromOpenAPI({
  openapiFilePath,
  outputDir,
  dryRun = false,
  prettier = true,
  eslint = true,
  zodSchemaJsDocs = true
}: GenerateTSFromOpenAPIOptions): Promise<string> {
  const parser = new SwaggerParser()
  const spec = (await parser.bundle(openapiFilePath)) as OpenAPIV3.Document
  // | OpenAPIV3_1.Document

  if (
    // TODO: make this less brittle
    spec.openapi !== '3.0.0' &&
    spec.openapi !== '3.1.0' &&
    spec.openapi !== '3.1.1' &&
    spec.openapi.split('.')[0] !== '3'
  ) {
    throw new Error(`Unexpected OpenAPI version "${spec.openapi}"`)
  }

  const openapiSpecName = path
    .basename(openapiFilePath)
    .replace(/\.json$/, '')
    .replace(/\.yaml$/, '')
  assert(
    openapiSpecName.toLowerCase() === openapiSpecName,
    `OpenAPI spec name "${openapiSpecName}" must be in kebab case`
  )
  const name = pascalCase(openapiSpecName)
  const nameLowerCase = name.toLowerCase()
  const nameSnakeCase = decamelize(name)
  const nameKebabCase = decamelize(name, { separator: '-' })
  const nameUpperCase = nameSnakeCase.toUpperCase()
  const clientName = `${name}Client`
  const namespaceName = nameLowerCase

  const destFileClient = path.join(outputDir, `${nameKebabCase}-client.ts`)
  const destFileTypes = path.join(outputDir, `${nameKebabCase}.ts`)
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

  const operationNames = new Set<string>()
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

      const operationId =
        operation.operationId || `${method}${path.replaceAll(/\W+/g, '_')}`
      assert(
        operationId,
        `Invalid operation id ${operationId} for path "${method} ${path}"`
      )

      const operationName = camelCase(operationId.replaceAll('/', '-'))
      assert(
        !operationNames.has(operationName),
        `Duplicate operation name "${operationName}"`
      )
      operationNames.add(operationName)
      const operationNameSnakeCaseTemp = decamelize(operationName)
      const operationNameSnakeCase = operationNameSnakeCaseTemp.startsWith(
        `${nameSnakeCase}_`
      )
        ? operationNameSnakeCaseTemp
        : `${nameSnakeCase}_${operationNameSnakeCaseTemp}`

      // if (path !== '/comments' || method !== 'post') continue
      // if (path !== '/crawl/status/{jobId}') continue
      // if (path !== '/pets' || method !== 'post') continue
      // console.log(method, path, operationName)

      const operationParamsJSONSchema = {
        type: 'object',
        properties: {} as Record<string, any>,
        required: [] as string[],
        $refs: [] as string[],
        oneOf: undefined as IJsonSchema[] | undefined,
        anyOf: undefined as IJsonSchema[] | undefined
        // TODO
        // allOf: undefined as IJsonSchema[] | undefined
      }

      const operationResponseJSONSchemas: Record<string, IJsonSchema> = {}

      const operationParamsSources: Record<string, Set<string>> = {}
      let operationParamsUnionSource: string | undefined

      // eslint-disable-next-line unicorn/consistent-function-scoping
      function addJSONSchemaParams(schema: IJsonSchema, source: string) {
        dereferenceFull(schema, parser.$refs, componentsToProcess)

        if (schema.$ref) {
          operationParamsJSONSchema.$refs.push(schema.$ref)

          const derefed = dereference(schema, parser.$refs, componentsToProcess)
          if (derefed?.properties) {
            for (const key of Object.keys(derefed.properties)) {
              // assert(
              //   !operationParamsSources[key],
              //   `Duplicate params key ${key} for operation ${operationName} from ${operationParamsSources[key]} and ${source}`
              // )
              operationParamsSources[key] = new Set([
                ...(operationParamsSources[key] || []),
                source
              ])
            }
          } else if (derefed?.anyOf || derefed?.oneOf) {
            const componentName = getComponentDisplayName(schema.$ref)
            operationParamsSources[componentName] = new Set([
              ...(operationParamsSources[componentName] || []),
              source
            ])

            // TODO: handle this case
            assert(
              !operationParamsUnionSource,
              `Duplicate union source ${source} for operation ${operationName}`
            )
            operationParamsUnionSource = source
          }
        } else {
          if (schema.properties) {
            operationParamsJSONSchema.properties = {
              ...operationParamsJSONSchema.properties,
              ...schema.properties
            }

            for (const key of Object.keys(schema.properties)) {
              // assert(
              //   !operationParamsSources[key],
              //   `Duplicate params key "${key}" for operation "${operationName}" from "${operationParamsSources[key]}" and "${source}"`
              // )
              operationParamsSources[key] = new Set([
                ...(operationParamsSources[key] || []),
                source
              ])
            }
          }

          if (schema.required) {
            operationParamsJSONSchema.required = [
              ...operationParamsJSONSchema.required,
              ...schema.required
            ]
          }

          if (schema.anyOf || schema.oneOf) {
            operationParamsJSONSchema.anyOf = schema.anyOf
            operationParamsJSONSchema.oneOf = schema.oneOf
            operationParamsSources[schema.title || '__union__'] = new Set([
              ...(operationParamsSources[schema.title || '__union__'] || []),
              source
            ])

            // TODO: handle this case
            assert(
              !operationParamsUnionSource,
              `Duplicate union source ${source} for operation ${operationName}`
            )
            operationParamsUnionSource = source
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
        const parameters = operation.parameters.map((param) =>
          dereference(param, parser.$refs, componentsToProcess)
        )
        const params = convertParametersToJSONSchema(parameters)

        if (params.body) {
          addJSONSchemaParams(params.body, 'body')
        }

        if (params.formData) {
          addJSONSchemaParams(params.formData, 'formData')
        }

        if (params.headers) {
          addJSONSchemaParams(params.headers, 'headers')
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
      let derefedParams: any = dereference(
        operationParamsJSONSchema,
        parser.$refs
      )
      for (const ref of derefedParams.$refs) {
        const temp: any = dereference({ $ref: ref }, parser.$refs)
        if (temp) {
          derefedParams = naiveMergeJSONSchemas(derefedParams, temp)
        }
      }
      // console.log(JSON.stringify(derefedParams, null, 2))
      const hasUnionParams = !!(derefedParams.anyOf || derefedParams.oneOf)
      const hasParams =
        Object.keys(derefedParams.properties ?? {}).length > 0 || hasUnionParams

      if (hasUnionParams !== !!operationParamsUnionSource) {
        console.log(
          JSON.stringify(
            { derefedParams, hasUnionParams, operationParamsUnionSource },
            null,
            2
          )
        )
      }

      assert(
        hasUnionParams === !!operationParamsUnionSource,
        `Unexpected union params for operation ${operationName}`
      )

      // TODO: handle empty params case

      {
        // Merge all operations params into one schema declaration
        // TODO: Don't generate this if it's only refs. We're currently handling
        // this in a hacky way by removing the `z.object({}).merge(...)` down
        // below.
        let operationsParamsSchema = jsonSchemaToZod(
          operationParamsJSONSchema,
          {
            name: `${operationParamsName}Schema`,
            type: operationParamsName,
            withJsdocs: zodSchemaJsDocs
          }
        )

        if (operationParamsJSONSchema.$refs.length) {
          const refSchemas = operationParamsJSONSchema.$refs.map(
            (ref) => `${getComponentDisplayName(ref)!}Schema`
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
          const componentName = getComponentDisplayName(
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
              type: operationResponseName,
              withJsdocs: zodSchemaJsDocs
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

      const queryParams = Object.keys(operationParamsSources).filter((key) =>
        operationParamsSources[key]?.has('query')
      )
      const hasQueryParams = queryParams.length > 0

      const bodyParams = Object.keys(operationParamsSources).filter((key) =>
        operationParamsSources[key]?.has('body')
      )
      const hasBodyParams = bodyParams.length > 0

      const formDataParams = Object.keys(operationParamsSources).filter((key) =>
        operationParamsSources[key]?.has('formData')
      )
      const hasFormDataParams = formDataParams.length > 0

      const pathParams = Object.keys(operationParamsSources).filter((key) =>
        operationParamsSources[key]?.has('path')
      )
      const hasPathParams = pathParams.length > 0

      const headersParams = Object.keys(operationParamsSources).filter((key) =>
        operationParamsSources[key]?.has('headers')
      )
      const hasHeadersParams = headersParams.length > 0

      const onlyHasOneParamsSource =
        new Set(Object.values(operationParamsSources)).size === 1
      const onlyHasPathParams = hasPathParams && onlyHasOneParamsSource

      const pathTemplate = hasPathParams
        ? '`' + path.replaceAll(/{([^}]+)}/g, '${params["$1"]}') + '`'
        : `'${path}'`

      const description = getDescription(
        operation.description || operation.summary
      )

      const { tags } = operation
      const hasTags = !!tags?.length

      const aiClientMethod = `
        ${description ? `/**\n * ${description}\n */` : ''}
        @aiFunction({
          name: '${operationNameSnakeCase}',
          ${description ? `description: \`${description.replaceAll('`', '\\`')}\`,` : ''}${hasUnionParams ? '\n// TODO: Improve handling of union params' : ''}
          inputSchema: ${namespaceName}.${operationParamsName}Schema${hasUnionParams ? ' as any' : ''}, ${hasTags ? `tags: [ '${tags.join("', '")}' ]` : ''}
        })
        async ${operationName}(${!hasParams ? '_' : ''}params: ${namespaceName}.${operationParamsName}): Promise<${namespaceName}.${operationResponseName}> {
          return this.ky.${method}(${pathTemplate}${
            !hasParams || onlyHasPathParams
              ? ''
              : `, {
            ${hasQueryParams ? (onlyHasOneParamsSource || hasUnionParams ? `searchParams: sanitizeSearchParams(params),` : `searchParams: sanitizeSearchParams(pick(params, '${queryParams.join("', '")}')),`) : ''}
            ${hasBodyParams ? (onlyHasOneParamsSource || hasUnionParams ? `json: params,` : `json: pick(params, '${bodyParams.join("', '")}'),`) : ''}
            ${hasFormDataParams ? (onlyHasOneParamsSource || hasUnionParams ? `form: params,` : `form: pick(params, '${formDataParams.join("', '")}'),`) : ''}
            ${hasHeadersParams ? (onlyHasOneParamsSource || hasUnionParams ? `headers: params,` : `headers: pick(params, '${headersParams.join("', '")}'),`) : ''}
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
    const component = { $ref: ref }

    const resolved = new Set<string>()
    const dereferenced = dereference(component, parser.$refs)
    dereferenceFull(component, parser.$refs, resolved)
    assert(dereferenced)

    for (const ref of resolved) {
      if (ref.startsWith('#/components/examples')) continue

      assert(
        componentsToProcess.has(ref),
        `Ref ${ref} not found in componentsToProcess`
      )
    }

    componentToRefs[ref] = { dereferenced, refs: resolved }
  }

  const sortedComponents = Object.keys(componentToRefs).sort(
    (a, b) => componentToRefs[a]!.refs.size - componentToRefs[b]!.refs.size
  )

  for (const ref of sortedComponents) {
    const type = getComponentDisplayName(ref)
    assert(type, `Invalid ref name ${ref}`)

    const name = `${type}Schema`

    const { dereferenced } = componentToRefs[ref]!
    if (processedComponents.has(ref)) {
      continue
    }

    processedComponents.add(ref)

    const schema = jsonSchemaToZod(dereferenced, {
      name,
      type,
      withJsdocs: zodSchemaJsDocs
    })
    componentSchemas[type] = schema
  }

  // console.log(
  //   '\ncomponents',
  //   JSON.stringify(
  //     sortedComponents.map((ref) => getComponentName(ref)),
  //     null,
  //     2
  //   )
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

  const prettifyImpl = async (code: string) => {
    if (prettier) {
      code = await prettify(code)
    }

    return code
      .replaceAll(/z\s*\.object\({}\)\s*\.merge\(([^)]*)\)/gm, '$1')
      .replaceAll(/\/\*\*(\S.*\S)\*\//g, '/** $1 */')
  }

  const typesHeader = `
/**
 * This file was auto-generated from an OpenAPI spec.
 */

import { z } from 'zod'`.trim()

  const clientHeader = `
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
import { ${namespaceName} } from './${nameKebabCase}'`.trim()

  const commentLine = `// ${'-'.repeat(77)}`
  const typesOutput = await prettifyImpl(
    [
      typesHeader,
      `export namespace ${namespaceName} {`,
      apiBaseUrl ? `export const apiBaseUrl = '${apiBaseUrl}'` : undefined,
      Object.values(componentSchemas).length
        ? `${commentLine}\n// Component schemas\n${commentLine}`
        : undefined,
      ...Object.values(componentSchemas),
      Object.values(operationSchemas).length
        ? `${commentLine}\n// Operation schemas\n${commentLine}`
        : undefined,
      ...Object.values(operationSchemas),
      '}'
    ]
      .filter(Boolean)
      .join('\n\n')
  )

  const description = getDescription(spec.info?.description)

  const clientOutput = await prettifyImpl(
    [
      clientHeader,
      `
/**
 * Agentic ${name} client.${description ? `\n *\n * ${description}` : ''}
 */
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
        ${apiKeyHeaderNames.map((name) => `'${(resolvedSecuritySchemes[name] as any).name || 'Authorization'}': ${(resolvedSecuritySchemes[name] as any).schema?.toLowerCase() === 'bearer' || resolvedSecuritySchemes[name]?.type?.toLowerCase() === 'oauth2' ? '`Bearer ${apiKey}`' : 'apiKey'}`).join(',\n')}
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

  const output = [typesOutput, clientOutput].join('\n\n')
  if (dryRun) {
    return output
  }

  await fs.mkdir(outputDir, { recursive: true })
  await fs.writeFile(destFileTypes, typesOutput)
  await fs.writeFile(destFileClient, clientOutput)

  if (eslint) {
    await execa('npx', [
      'eslint',
      '--fix',
      '--no-ignore',
      destFileClient,
      destFileTypes
    ])
  }

  return output
}
