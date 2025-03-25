/**
 * This file was auto-generated from an OpenAPI spec.
 */

import { z } from 'zod'

export namespace security {
  export const apiBaseUrl = 'https://httpbin.org'

  // -----------------------------------------------------------------------------
  // Operation schemas
  // -----------------------------------------------------------------------------

  export const GetAnythingApiKeyParamsSchema = z.object({})
  export type GetAnythingApiKeyParams = z.infer<
    typeof GetAnythingApiKeyParamsSchema
  >

  export type GetAnythingApiKeyResponse = undefined

  export const PostAnythingApiKeyParamsSchema = z.object({})
  export type PostAnythingApiKeyParams = z.infer<
    typeof PostAnythingApiKeyParamsSchema
  >

  export type PostAnythingApiKeyResponse = undefined

  export const PutAnythingApiKeyParamsSchema = z.object({})
  export type PutAnythingApiKeyParams = z.infer<
    typeof PutAnythingApiKeyParamsSchema
  >

  export type PutAnythingApiKeyResponse = undefined

  export const PostAnythingBasicParamsSchema = z.object({})
  export type PostAnythingBasicParams = z.infer<
    typeof PostAnythingBasicParamsSchema
  >

  export type PostAnythingBasicResponse = undefined

  export const PostAnythingBearerParamsSchema = z.object({})
  export type PostAnythingBearerParams = z.infer<
    typeof PostAnythingBearerParamsSchema
  >

  export type PostAnythingBearerResponse = undefined

  export const PutAnythingBearerParamsSchema = z.object({})
  export type PutAnythingBearerParams = z.infer<
    typeof PutAnythingBearerParamsSchema
  >

  export type PutAnythingBearerResponse = undefined

  export const GetAnythingOauth2ParamsSchema = z.object({})
  export type GetAnythingOauth2Params = z.infer<
    typeof GetAnythingOauth2ParamsSchema
  >

  export type GetAnythingOauth2Response = undefined

  export const PostAnythingOauth2ParamsSchema = z.object({})
  export type PostAnythingOauth2Params = z.infer<
    typeof PostAnythingOauth2ParamsSchema
  >

  export type PostAnythingOauth2Response = undefined

  export const PutAnythingOauth2ParamsSchema = z.object({})
  export type PutAnythingOauth2Params = z.infer<
    typeof PutAnythingOauth2ParamsSchema
  >

  export type PutAnythingOauth2Response = undefined

  export const DeleteAnythingOauth2ParamsSchema = z.object({})
  export type DeleteAnythingOauth2Params = z.infer<
    typeof DeleteAnythingOauth2ParamsSchema
  >

  export type DeleteAnythingOauth2Response = undefined

  export const PatchAnythingOauth2ParamsSchema = z.object({})
  export type PatchAnythingOauth2Params = z.infer<
    typeof PatchAnythingOauth2ParamsSchema
  >

  export type PatchAnythingOauth2Response = undefined

  export const PostAnythingOpenIdConnectParamsSchema = z.object({})
  export type PostAnythingOpenIdConnectParams = z.infer<
    typeof PostAnythingOpenIdConnectParamsSchema
  >

  export type PostAnythingOpenIdConnectResponse = undefined

  export const PostAnythingNoAuthParamsSchema = z.object({})
  export type PostAnythingNoAuthParams = z.infer<
    typeof PostAnythingNoAuthParamsSchema
  >

  export type PostAnythingNoAuthResponse = undefined

  export const GetAnythingOptionalAuthParamsSchema = z.object({})
  export type GetAnythingOptionalAuthParams = z.infer<
    typeof GetAnythingOptionalAuthParamsSchema
  >

  export type GetAnythingOptionalAuthResponse = undefined

  export const PostStatus401ParamsSchema = z.object({})
  export type PostStatus401Params = z.infer<typeof PostStatus401ParamsSchema>

  export type PostStatus401Response = undefined
}
