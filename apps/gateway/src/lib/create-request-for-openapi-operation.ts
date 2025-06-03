import type {
  AdminDeployment,
  OpenAPIToolOperation,
  Tool
} from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'

import { validateJsonSchemaObject } from './validate-json-schema-object'

export async function createRequestForOpenAPIOperation({
  request,
  tool,
  operation,
  deployment
}: {
  request: Request
  tool: Tool
  operation: OpenAPIToolOperation
  deployment: AdminDeployment
}): Promise<Request> {
  assert(
    deployment.originAdapter.type === 'openapi',
    500,
    `Unexpected origin adapter type: "${deployment.originAdapter.type}"`
  )

  const tempInitialRequest = request.clone()

  let incomingRequestParams: Record<string, any> = {}
  if (request.method === 'GET') {
    incomingRequestParams = Object.fromEntries(
      new URL(tempInitialRequest.url).searchParams.entries()
    )
  } else if (request.method === 'POST') {
    incomingRequestParams = (await tempInitialRequest.json()) as Record<
      string,
      any
    >
  }

  // TODO: Validate incoming request params against the tool's input JSON schema
  validateJsonSchemaObject({
    schema: tool.inputSchema,
    data: incomingRequestParams,
    errorMessage: `Invalid request parameters for tool "${tool.name}"`
  })

  // TODO: Make this more efficient by changing the `parameterSources` data structure
  const params = Object.entries(operation.parameterSources)
  const bodyParams = params.filter(([_key, source]) => source === 'body')
  const formDataParams = params.filter(
    ([_key, source]) => source === 'formData'
  )
  const headerParams = params.filter(([_key, source]) => source === 'header')
  const pathParams = params.filter(([_key, source]) => source === 'path')
  const queryParams = params.filter(([_key, source]) => source === 'query')
  const cookieParams = params.filter(([_key, source]) => source === 'cookie')
  assert(
    !cookieParams.length,
    500,
    'Cookie parameters for OpenAPI operations are not yet supported. If you need cookie parameter support, please contact support@agentic.so.'
  )

  const headers: Record<string, string> = {}
  if (headerParams.length > 0) {
    for (const [key] of headerParams) {
      headers[key] =
        (tempInitialRequest.headers.get(key) as string) ??
        incomingRequestParams[key]
    }
  }

  for (const [key] of cookieParams) {
    headers[key] = String(incomingRequestParams[key])
  }

  let body: string | undefined
  if (bodyParams.length > 0) {
    body = JSON.stringify(
      Object.fromEntries(
        bodyParams.map(([key]) => [key, incomingRequestParams[key]])
      )
    )

    headers['content-type'] ??= 'application/json'
  } else if (formDataParams.length > 0) {
    body = JSON.stringify(
      Object.fromEntries(
        formDataParams.map(([key]) => [key, incomingRequestParams[key]])
      )
    )

    headers['content-type'] ??= 'application/x-www-form-urlencoded'
  }

  let path = operation.path
  if (pathParams.length > 0) {
    for (const [key] of pathParams) {
      const value: string = incomingRequestParams[key]
      assert(value, 400, `Missing required parameter "${key}"`)

      const pathParamPlaceholder = `{${key}}`
      assert(
        path.includes(pathParamPlaceholder),
        500,
        `Misconfigured OpenAPI deployment "${deployment.id}": invalid path "${operation.path}" missing required path parameter "${key}"`
      )

      path = path.replaceAll(pathParamPlaceholder, value)
    }
  }
  assert(
    !/\{\w+\}/.test(path),
    500,
    `Misconfigured OpenAPI deployment "${deployment.id}": invalid path "${operation.path}"`
  )

  const query = new URLSearchParams()
  for (const [key] of queryParams) {
    query.set(key, incomingRequestParams[key] as string)
  }
  const queryString = query.toString()
  const originRequestUrl = `${deployment.originUrl}${path}${
    queryString ? `?${queryString}` : ''
  }`

  return new Request(originRequestUrl, {
    method: operation.method,
    body,
    headers
  })
}
