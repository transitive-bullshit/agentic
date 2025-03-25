/**
 * This file was auto-generated from an OpenAPI spec.
 */

import { aiFunction,AIFunctionsProvider } from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'

import { security } from './security'

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
    inputSchema: security.GetAnythingApiKeyParamsSchema,
    tags: ['API Key']
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
    inputSchema: security.PostAnythingApiKeyParamsSchema,
    tags: ['API Key']
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
    inputSchema: security.PutAnythingApiKeyParamsSchema,
    tags: ['API Key']
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
    inputSchema: security.PostAnythingBasicParamsSchema,
    tags: ['HTTP']
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
    inputSchema: security.PostAnythingBearerParamsSchema,
    tags: ['HTTP']
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
    inputSchema: security.PutAnythingBearerParamsSchema,
    tags: ['HTTP']
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
    inputSchema: security.GetAnythingOauth2ParamsSchema,
    tags: ['OAuth 2']
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
    inputSchema: security.PostAnythingOauth2ParamsSchema,
    tags: ['OAuth 2']
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
    inputSchema: security.PutAnythingOauth2ParamsSchema,
    tags: ['OAuth 2']
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
    inputSchema: security.DeleteAnythingOauth2ParamsSchema,
    tags: ['OAuth 2']
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
    inputSchema: security.PatchAnythingOauth2ParamsSchema,
    tags: ['OAuth 2']
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
    inputSchema: security.PostAnythingOpenIdConnectParamsSchema,
    tags: ['OpenID Connect']
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
    inputSchema: security.PostAnythingNoAuthParamsSchema,
    tags: ['Other']
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
    inputSchema: security.GetAnythingOptionalAuthParamsSchema,
    tags: ['Other']
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
    inputSchema: security.PostStatus401ParamsSchema,
    tags: ['Other']
  })
  async postStatus401(
    _params: security.PostStatus401Params
  ): Promise<security.PostStatus401Response> {
    return this.ky.post('/status/401').json<security.PostStatus401Response>()
  }
}
