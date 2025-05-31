import type {
  AdminDeployment,
  OpenAPIToolOperation
} from '@agentic/platform-types'
import { assert } from '@agentic/platform-core'

export async function createRequestForOpenAPIOperation({
  request,
  operation,
  deployment
}: {
  request: Request
  operation: OpenAPIToolOperation
  deployment: AdminDeployment
}): Promise<Request> {
  const tempInitialRequest = request.clone()
  const tempInitialRequestBody: any = await tempInitialRequest.json()

  const params = Object.entries(operation.parameterSources)

  // TODO: Make this more efficient by changing the `parameterSources` data structure
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
      headers[key] = tempInitialRequest.headers.get(key) as string
    }
  }

  for (const [key] of cookieParams) {
    headers[key] = tempInitialRequestBody[key] as string
  }

  let body: string | undefined
  if (bodyParams.length > 0) {
    body = JSON.stringify(
      Object.fromEntries(
        bodyParams.map(([key]) => [key, tempInitialRequestBody[key] as any])
      )
    )

    headers['content-type'] ??= 'application/json'
  } else if (formDataParams.length > 0) {
    body = JSON.stringify(
      Object.fromEntries(
        formDataParams.map(([key]) => [key, tempInitialRequestBody[key] as any])
      )
    )

    headers['content-type'] ??= 'application/x-www-form-urlencoded'
  }

  let path = operation.path
  if (pathParams.length > 0) {
    for (const [key] of pathParams) {
      const value: string = tempInitialRequestBody[key]
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
    query.set(key, tempInitialRequestBody[key] as string)
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
