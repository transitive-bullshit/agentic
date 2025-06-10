import type { ContentfulStatusCode } from 'hono/utils/http-status'

/**
 * Error codes defined by the JSON-RPC specification.
 *
 * @see https://www.jsonrpc.org/specification
 */
export enum JsonRpcErrorCodes {
  ConnectionClosed = -32_000,
  RequestTimeout = -32_001,
  ParseError = -32_700,
  InvalidRequest = -32_600,
  MethodNotFound = -32_601,
  InvalidParams = -32_602,
  InternalError = -32_603,

  // Non-standard error codes
  // @see https://json-rpc.dev/docs/reference/error-codes
  RateLimitExceeded = -32_002
}

export function httpStatusCodeToJsonRpcErrorCode(
  statusCode: ContentfulStatusCode
): number {
  if (statusCode === 429) {
    return JsonRpcErrorCodes.RateLimitExceeded
  }

  if (statusCode >= 400 && statusCode < 500) {
    return JsonRpcErrorCodes.InvalidRequest
  }

  return JsonRpcErrorCodes.InternalError
}
