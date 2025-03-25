/* eslint-disable unicorn/no-unreadable-iife */
/* eslint-disable unicorn/no-array-reduce */

/**
 * This file was auto-generated from an OpenAPI spec.
 */

import { aiFunction,AIFunctionsProvider } from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
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

/**
 * Agentic Security client.
 *
 * https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#securitySchemeObject.
 */
export class SecurityClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance

  protected readonly apiBaseUrl: string

  constructor({
    apiBaseUrl = security.apiBaseUrl,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    super()

    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl
    })
  }

  /**
   * `apiKey` auth will be supplied within an `apiKey` query parameter.
   */
  @aiFunction({
    name: 'security_get_anything_api_key',
    description: `\`apiKey\` auth will be supplied within an \`apiKey\` query parameter.`,
    inputSchema: security.GetAnythingApiKeyParamsSchema
  })
  async getAnythingApiKey(
    _params: security.GetAnythingApiKeyParams
  ): Promise<security.GetAnythingApiKeyResponse> {
    return this.ky
      .get('/anything/apiKey')
      .json<security.GetAnythingApiKeyResponse>()
  }

  /**
   * `apiKey` auth will be supplied within an `api_key` cookie.
   */
  @aiFunction({
    name: 'security_post_anything_api_key',
    description: `\`apiKey\` auth will be supplied within an \`api_key\` cookie.`,
    inputSchema: security.PostAnythingApiKeyParamsSchema
  })
  async postAnythingApiKey(
    _params: security.PostAnythingApiKeyParams
  ): Promise<security.PostAnythingApiKeyResponse> {
    return this.ky
      .post('/anything/apiKey')
      .json<security.PostAnythingApiKeyResponse>()
  }

  /**
   * `apiKey` auth will be supplied within an `X-API-KEY` header.
   */
  @aiFunction({
    name: 'security_put_anything_api_key',
    description: `\`apiKey\` auth will be supplied within an \`X-API-KEY\` header.`,
    inputSchema: security.PutAnythingApiKeyParamsSchema
  })
  async putAnythingApiKey(
    _params: security.PutAnythingApiKeyParams
  ): Promise<security.PutAnythingApiKeyResponse> {
    return this.ky
      .put('/anything/apiKey')
      .json<security.PutAnythingApiKeyResponse>()
  }

  /**
 * Authentication credentials will be supplied within a `Basic` `Authorization` header.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#basic-authentication-sample.
 */
  @aiFunction({
    name: 'security_post_anything_basic',
    description: `Authentication credentials will be supplied within a \`Basic\` \`Authorization\` header.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#basic-authentication-sample.`,
    inputSchema: security.PostAnythingBasicParamsSchema
  })
  async postAnythingBasic(
    _params: security.PostAnythingBasicParams
  ): Promise<security.PostAnythingBasicResponse> {
    return this.ky
      .post('/anything/basic')
      .json<security.PostAnythingBasicResponse>()
  }

  /**
 * Authentication credentials will be supplied within a `Bearer` `Authorization` header.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#basic-authentication-sample.
 */
  @aiFunction({
    name: 'security_post_anything_bearer',
    description: `Authentication credentials will be supplied within a \`Bearer\` \`Authorization\` header.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#basic-authentication-sample.`,
    inputSchema: security.PostAnythingBearerParamsSchema
  })
  async postAnythingBearer(
    _params: security.PostAnythingBearerParams
  ): Promise<security.PostAnythingBearerResponse> {
    return this.ky
      .post('/anything/bearer')
      .json<security.PostAnythingBearerResponse>()
  }

  /**
 * Authentication credentials will be supplied within a `Bearer` `Authorization` header, but its data should be controlled as a JWT.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#basic-authentication-sample

> ℹ️
> We currently do not support any special handling for this so they're handled as a standard `Bearer` authentication token.
 */
  @aiFunction({
    name: 'security_put_anything_bearer',
    description: `Authentication credentials will be supplied within a \`Bearer\` \`Authorization\` header, but its data should be controlled as a JWT.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#basic-authentication-sample

> ℹ️
> We currently do not support any special handling for this so they're handled as a standard \`Bearer\` authentication token.`,
    inputSchema: security.PutAnythingBearerParamsSchema
  })
  async putAnythingBearer(
    _params: security.PutAnythingBearerParams
  ): Promise<security.PutAnythingBearerResponse> {
    return this.ky
      .put('/anything/bearer')
      .json<security.PutAnythingBearerResponse>()
  }

  /**
 * > ℹ️
> We currently do not handle OAuth 2 authentication flows so if an operation has an `oauth2` requirement we assume that the user, or the projects JWT, has a qualified `bearer` token and will use that.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#fixed-fields-23.
 */
  @aiFunction({
    name: 'security_get_anything_oauth2',
    description: `> ℹ️
> We currently do not handle OAuth 2 authentication flows so if an operation has an \`oauth2\` requirement we assume that the user, or the projects JWT, has a qualified \`bearer\` token and will use that.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#fixed-fields-23.`,
    inputSchema: security.GetAnythingOauth2ParamsSchema
  })
  async getAnythingOauth2(
    _params: security.GetAnythingOauth2Params
  ): Promise<security.GetAnythingOauth2Response> {
    return this.ky
      .get('/anything/oauth2')
      .json<security.GetAnythingOauth2Response>()
  }

  /**
 * > ℹ️
> We currently do not handle OAuth 2 authentication flows so if an operation has an `oauth2` requirement we assume that the user, or the projects JWT, has a qualified `bearer` token and will use that.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#fixed-fields-23.
 */
  @aiFunction({
    name: 'security_post_anything_oauth2',
    description: `> ℹ️
> We currently do not handle OAuth 2 authentication flows so if an operation has an \`oauth2\` requirement we assume that the user, or the projects JWT, has a qualified \`bearer\` token and will use that.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#fixed-fields-23.`,
    inputSchema: security.PostAnythingOauth2ParamsSchema
  })
  async postAnythingOauth2(
    _params: security.PostAnythingOauth2Params
  ): Promise<security.PostAnythingOauth2Response> {
    return this.ky
      .post('/anything/oauth2')
      .json<security.PostAnythingOauth2Response>()
  }

  /**
 * > ℹ️
> We currently do not handle OAuth 2 authentication flows so if an operation has an `oauth2` requirement we assume that the user, or the projects JWT, has a qualified `bearer` token and will use that.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#fixed-fields-23.
 */
  @aiFunction({
    name: 'security_put_anything_oauth2',
    description: `> ℹ️
> We currently do not handle OAuth 2 authentication flows so if an operation has an \`oauth2\` requirement we assume that the user, or the projects JWT, has a qualified \`bearer\` token and will use that.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#fixed-fields-23.`,
    inputSchema: security.PutAnythingOauth2ParamsSchema
  })
  async putAnythingOauth2(
    _params: security.PutAnythingOauth2Params
  ): Promise<security.PutAnythingOauth2Response> {
    return this.ky
      .put('/anything/oauth2')
      .json<security.PutAnythingOauth2Response>()
  }

  /**
 * > ℹ️
> We currently do not handle OAuth 2 authentication flows so if an operation has an `oauth2` requirement we assume that the user, or the projects JWT, has a qualified `bearer` token and will use that.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#fixed-fields-23.
 */
  @aiFunction({
    name: 'security_delete_anything_oauth2',
    description: `> ℹ️
> We currently do not handle OAuth 2 authentication flows so if an operation has an \`oauth2\` requirement we assume that the user, or the projects JWT, has a qualified \`bearer\` token and will use that.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#fixed-fields-23.`,
    inputSchema: security.DeleteAnythingOauth2ParamsSchema
  })
  async deleteAnythingOauth2(
    _params: security.DeleteAnythingOauth2Params
  ): Promise<security.DeleteAnythingOauth2Response> {
    return this.ky
      .delete('/anything/oauth2')
      .json<security.DeleteAnythingOauth2Response>()
  }

  /**
 * > ℹ️
> We currently do not handle OAuth 2 authentication flows so if an operation has an `oauth2` requirement we assume that the user, or the projects JWT, has a qualified `bearer` token and will use that.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#fixed-fields-23.
 */
  @aiFunction({
    name: 'security_patch_anything_oauth2',
    description: `> ℹ️
> We currently do not handle OAuth 2 authentication flows so if an operation has an \`oauth2\` requirement we assume that the user, or the projects JWT, has a qualified \`bearer\` token and will use that.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#fixed-fields-23.`,
    inputSchema: security.PatchAnythingOauth2ParamsSchema
  })
  async patchAnythingOauth2(
    _params: security.PatchAnythingOauth2Params
  ): Promise<security.PatchAnythingOauth2Response> {
    return this.ky
      .patch('/anything/oauth2')
      .json<security.PatchAnythingOauth2Response>()
  }

  /**
   * 🚧 This is not supported.
   */
  @aiFunction({
    name: 'security_post_anything_open_id_connect',
    description: `🚧 This is not supported.`,
    inputSchema: security.PostAnythingOpenIdConnectParamsSchema
  })
  async postAnythingOpenIdConnect(
    _params: security.PostAnythingOpenIdConnectParams
  ): Promise<security.PostAnythingOpenIdConnectResponse> {
    return this.ky
      .post('/anything/openIdConnect')
      .json<security.PostAnythingOpenIdConnectResponse>()
  }

  /**
   * This operation does not have any authentication requirements.
   */
  @aiFunction({
    name: 'security_post_anything_no_auth',
    description: `This operation does not have any authentication requirements.`,
    inputSchema: security.PostAnythingNoAuthParamsSchema
  })
  async postAnythingNoAuth(
    _params: security.PostAnythingNoAuthParams
  ): Promise<security.PostAnythingNoAuthResponse> {
    return this.ky
      .post('/anything/no-auth')
      .json<security.PostAnythingNoAuthResponse>()
  }

  /**
 * The `apiKey` query parameter auth on this operation is optional.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#security-requirement-object.
 */
  @aiFunction({
    name: 'security_get_anything_optional_auth',
    description: `The \`apiKey\` query parameter auth on this operation is optional.

https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.0.3.md#security-requirement-object.`,
    inputSchema: security.GetAnythingOptionalAuthParamsSchema
  })
  async getAnythingOptionalAuth(
    _params: security.GetAnythingOptionalAuthParams
  ): Promise<security.GetAnythingOptionalAuthResponse> {
    return this.ky
      .get('/anything/optional-auth')
      .json<security.GetAnythingOptionalAuthResponse>()
  }

  /**
   * This endpoint requires an authentication header but making any request to it will forcefully return a 401 status code for invalid auth.
   */
  @aiFunction({
    name: 'security_post_status401',
    description: `This endpoint requires an authentication header but making any request to it will forcefully return a 401 status code for invalid auth.`,
    inputSchema: security.PostStatus401ParamsSchema
  })
  async postStatus401(
    _params: security.PostStatus401Params
  ): Promise<security.PostStatus401Response> {
    return this.ky.post('/status/401').json<security.PostStatus401Response>()
  }
}
