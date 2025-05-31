import { assert, parseZodSchema } from '@agentic/platform-core'
import {
  type OpenAPIOperationHttpMethod,
  type OpenAPIOperationParameterSource,
  type OpenAPIToolOperation,
  openapiToolOperationSchema,
  type Tool,
  toolSchema
} from '@agentic/platform-types'
import decamelize from 'decamelize'

import type {
  DereferencedLooseOpenAPI3Spec,
  OperationObject,
  ParameterObject,
  SchemaObject
} from './types'
import { convertParametersToJsonSchema } from './openapi-parameters-to-json-schema'
import { camelCase, mergeJsonSchemaObjects } from './utils'

const jsonContentType = 'application/json'
const multipartFormData = 'multipart/form-data'

const httpMethods = ['get', 'post', 'put', 'delete', 'patch', 'trace'] as const
const paramSources = ['body', 'formData', 'header', 'path', 'query'] as const

/**
 * Converts a fully dereferenced and validated OpenAPI spec into an array of
 * MCP-compatible tools, with a map of tool names to their corresponding OpenAPI
 * operations.
 *
 * This allows us to expose OpenAPI HTTP operations as MCP tools and convert
 * MCP tool calls to corresponding HTTP requests.
 */
export async function getToolsFromOpenAPISpec(
  spec: DereferencedLooseOpenAPI3Spec
): Promise<{
  tools: Tool[]
  toolToOperationMap: Record<string, OpenAPIToolOperation>
}> {
  const tools: Tool[] = []
  const toolToOperationMap: Record<string, OpenAPIToolOperation> = {}

  const requestBodyJsonSchemaPaths = [
    'requestBody',
    'content',
    jsonContentType,
    'schema'
  ]

  const requestBodyFormDataJsonSchemaPaths = [
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
    requestBodyJsonSchemaPaths,
    requestBodyFormDataJsonSchemaPaths
  ]

  const operationNames = new Set<string>()

  for (const path in spec.paths) {
    const pathItem = spec.paths[path]
    assert(pathItem)
    // console.log(JSON.stringify(pathItem, null, 2))

    const pathParamsJsonSchema = {
      type: 'object',
      properties: {} as Record<string, SchemaObject>,
      required: [] as string[]
    } satisfies SchemaObject
    const pathParamsSources: Record<string, OpenAPIOperationParameterSource> =
      {}

    if (pathItem.parameters) {
      const params = convertParametersToJsonSchema(
        pathItem.parameters as ParameterObject[]
      )

      for (const source of paramSources) {
        if (params[source]) {
          mergeJsonSchemaObjects(pathParamsJsonSchema, params[source], {
            source,
            sources: pathParamsSources,
            label: `path "${path}"`
          })
        }
      }
    }

    for (const method of httpMethods) {
      const operation = pathItem[method] as OperationObject
      if (!operation) {
        continue
      }

      const operationId =
        operation.operationId || `${method}${path.replaceAll(/\W+/g, '_')}`
      assert(
        operationId,
        `Invalid operation id "${operationId}" for OpenAPI path "${method} ${path}"`
      )

      const operationName = camelCase(operationId.replaceAll('/', '_'))
      const operationNameSnakeCase = decamelize(operationName)
      assert(
        !operationNames.has(operationName),
        `Duplicate operation name "${operationName}"`
      )
      operationNames.add(operationName)

      const operationParamsJsonSchema = structuredClone(pathParamsJsonSchema)
      const operationParamsSources: Record<
        string,
        OpenAPIOperationParameterSource
      > = structuredClone(pathParamsSources)
      const operationResponseJsonSchemas: Record<string, SchemaObject> = {}

      for (const schemaPath of operationRequestPaths) {
        let current: any = operation
        for (const key of schemaPath) {
          current = current[key]
          if (!current) break
        }

        if (current) {
          mergeJsonSchemaObjects(operationParamsJsonSchema, current, {
            source: schemaPath[2] === jsonContentType ? 'body' : 'formData',
            sources: operationParamsSources,
            label: `operation "${operationId}"`
          })
          break
        }
      }

      for (const schemaPath of operationResponsePaths) {
        let current: any = operation
        for (const key of schemaPath) {
          current = current[key]
          if (!current) break
        }

        if (current) {
          const status = schemaPath[1]!
          assert(
            status,
            `Invalid status ${status} for operation ${operationName}`
          )

          if (current.type !== 'object') {
            // console.warn(
            //   `Invalid OpenAPI response type "${current.type}" for operation "${operationName}"`
            // )
            break
          }

          operationResponseJsonSchemas[status] = current
          break
        }
      }

      if (operation.parameters) {
        const params = convertParametersToJsonSchema(
          operation.parameters as ParameterObject[]
        )

        for (const source of paramSources) {
          if (params[source]) {
            mergeJsonSchemaObjects(pathParamsJsonSchema, params[source], {
              source,
              sources: operationParamsSources,
              label: `operation "${operationId}"`
            })
          }
        }
      }

      const operationResponseJsonSchema =
        operationResponseJsonSchemas['200'] ||
        operationResponseJsonSchemas['201']
      const description = operation.description || operation.summary
      const { tags } = operation

      tools.push(
        parseZodSchema(toolSchema, {
          name: operationNameSnakeCase,
          description,
          inputSchema: operationParamsJsonSchema,
          outputSchema: operationResponseJsonSchema
        })
      )

      toolToOperationMap[operationNameSnakeCase] = parseZodSchema(
        openapiToolOperationSchema,
        {
          operationId,
          method: method.toLowerCase() as OpenAPIOperationHttpMethod,
          path,
          parameterSources: operationParamsSources,
          tags
        }
      )
    }
  }

  return {
    tools,
    toolToOperationMap
  }
}
