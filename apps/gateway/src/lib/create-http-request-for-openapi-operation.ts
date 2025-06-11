import type {
  AdminDeployment,
  OpenAPIToolOperation,
  ToolConfig
} from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'

import type { ToolCallArgs } from './types'

export async function createHttpRequestForOpenAPIOperation({
  toolCallArgs,
  operation,
  deployment,
  request,
  toolConfig
}: {
  toolCallArgs: ToolCallArgs
  operation: OpenAPIToolOperation
  deployment: AdminDeployment
  request?: Request
  toolConfig?: ToolConfig
}): Promise<Request> {
  assert(toolCallArgs, 500, 'Tool args are required')
  assert(
    deployment.originAdapter.type === 'openapi',
    500,
    `Internal logic error for origin adapter type "${deployment.originAdapter.type}"`
  )

  const { method } = operation
  const methodHasBody =
    method === 'post' || method === 'put' || method === 'patch'

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

  const extraArgs =
    toolConfig?.additionalProperties === false
      ? []
      : // TODO: Make this more efficient...
        Object.keys(toolCallArgs).filter((key) => {
          if (bodyParams.some(([paramKey]) => paramKey === key)) return false
          if (formDataParams.some(([paramKey]) => paramKey === key))
            return false
          if (headerParams.some(([paramKey]) => paramKey === key)) return false
          if (queryParams.some(([paramKey]) => paramKey === key)) return false
          if (pathParams.some(([paramKey]) => paramKey === key)) return false
          if (cookieParams.some(([paramKey]) => paramKey === key)) return false
          return true
        })
  const extraArgsEntries = extraArgs
    .map((key) => [key, toolCallArgs[key]])
    .filter(([, value]) => value !== undefined)

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
  if (methodHasBody) {
    if (bodyParams.length > 0 || !formDataParams.length) {
      const bodyJson = Object.fromEntries(
        bodyParams
          .map(([key]) => [key, toolCallArgs[key]])
          .concat(extraArgsEntries)
          // Prune undefined values. We know these aren't required fields,
          // because the incoming request params have already been validated
          // against the tool's input schema.
          .filter(([, value]) => value !== undefined)
      )

      body = JSON.stringify(bodyJson)
      headers['content-type'] = 'application/json'
      headers['content-length'] = body.length.toString()
    } else if (formDataParams.length > 0) {
      // TODO: Double-check FormData usage.
      const bodyFormData = new FormData()

      for (const [key] of formDataParams) {
        const value = toolCallArgs[key]
        if (value !== undefined) {
          bodyFormData.append(key, value)
        }
      }

      for (const [key, value] of extraArgsEntries) {
        bodyFormData.append(key, value)
      }

      body = bodyFormData.toString()
      headers['content-type'] = 'application/x-www-form-urlencoded'
      headers['content-length'] = body.length.toString()
    }
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

  if (!methodHasBody) {
    for (const [key, value] of extraArgsEntries) {
      query.set(key, value)
    }
  }

  const queryString = query.toString()
  const originRequestUrl = `${deployment.originUrl}${path}${
    queryString ? `?${queryString}` : ''
  }`

  return new Request(originRequestUrl, {
    method: method.toUpperCase(),
    body,
    headers
  })
}
