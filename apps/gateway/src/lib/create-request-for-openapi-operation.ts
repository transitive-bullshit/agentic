import type {
  AdminDeployment,
  OpenAPIToolOperation
} from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'

import type { ToolCallArgs } from './types'

export async function createRequestForOpenAPIOperation({
  toolCallArgs,
  operation,
  deployment,
  request
}: {
  toolCallArgs: ToolCallArgs
  operation: OpenAPIToolOperation
  deployment: AdminDeployment
  request?: Request
}): Promise<Request> {
  assert(toolCallArgs, 500, 'Tool args are required')
  assert(
    deployment.originAdapter.type === 'openapi',
    500,
    `Internal logic error for origin adapter type "${deployment.originAdapter.type}"`
  )

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
  if (request) {
    // TODO: do we want to expose these? especially authorization?
    for (const [key, value] of request.headers.entries()) {
      headers[key] = value
    }
  }

  if (headerParams.length > 0) {
    for (const [key] of headerParams) {
      headers[key] = (request?.headers.get(key) as string) ?? toolCallArgs[key]
    }
  }

  for (const [key] of cookieParams) {
    headers[key] = String(toolCallArgs[key])
  }

  let body: string | undefined
  if (bodyParams.length > 0) {
    body = JSON.stringify(
      Object.fromEntries(
        bodyParams
          .map(([key]) => [key, toolCallArgs[key]])
          // Prune undefined values. We know these aren't required fields,
          // because the incoming request params have already been validated
          // against the tool's input schema.
          .filter(([, value]) => value !== undefined)
      )
    )

    headers['content-type'] ??= 'application/json'
  } else if (formDataParams.length > 0) {
    // TODO: Double-check FormData usage.
    const formData = new FormData()
    for (const [key] of formDataParams) {
      const value = toolCallArgs[key]
      if (value !== undefined) {
        formData.append(key, value)
      }
    }

    body = formData.toString()
    headers['content-type'] ??= 'application/x-www-form-urlencoded'
  }

  let path = operation.path
  if (pathParams.length > 0) {
    for (const [key] of pathParams) {
      const value: string = toolCallArgs[key]
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
    query.set(key, toolCallArgs[key] as string)
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
