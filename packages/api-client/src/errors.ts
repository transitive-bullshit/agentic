/**
 * A list of errors that can be thrown by OpenAuth.
 *
 * You can use these errors to check the type of error and handle it. For example.
 *
 * ```ts
 * import { InvalidAuthorizationCodeError } from "@agentic/api-client/error"
 *
 * if (err instanceof InvalidAuthorizationCodeError) {
 *   // handle invalid code error
 * }
 * ```
 *
 * @packageDocumentation
 */

/**
 * The OAuth server returned an error.
 */
export class OauthError extends Error {
  constructor(
    public error:
      | 'invalid_request'
      | 'invalid_grant'
      | 'unauthorized_client'
      | 'access_denied'
      | 'unsupported_grant_type'
      | 'server_error'
      | 'temporarily_unavailable',
    public description: string
  ) {
    super(error + ' - ' + description)
  }
}

/**
 * The `provider` needs to be passed in.
 */
export class MissingProviderError extends OauthError {
  constructor() {
    super(
      'invalid_request',
      'Must specify `provider` query parameter if `select` callback on issuer is not specified'
    )
  }
}

/**
 * The given parameter is missing.
 */
export class MissingParameterError extends OauthError {
  constructor(public parameter: string) {
    super('invalid_request', 'Missing parameter: ' + parameter)
  }
}

/**
 * The given client is not authorized to use the redirect URI that was passed in.
 */
export class UnauthorizedClientError extends OauthError {
  constructor(
    public clientID: string,
    redirectURI: string
  ) {
    super(
      'unauthorized_client',
      `Client ${clientID} is not authorized to use this redirect_uri: ${redirectURI}`
    )
  }
}

/**
 * The browser was in an unknown state.
 *
 * This can happen when certain cookies have expired. Or the browser was switched in the middle
 * of the authentication flow.
 */
export class UnknownStateError extends Error {
  constructor() {
    super(
      'The browser was in an unknown state. This could be because certain cookies expired or the browser was switched in the middle of an authentication flow.'
    )
  }
}

/**
 * The given subject is invalid.
 */
export class InvalidSubjectError extends Error {
  constructor() {
    super('Invalid subject')
  }
}

/**
 * The given refresh token is invalid.
 */
export class InvalidRefreshTokenError extends Error {
  constructor() {
    super('Invalid refresh token')
  }
}

/**
 * The given access token is invalid.
 */
export class InvalidAccessTokenError extends Error {
  constructor() {
    super('Invalid access token')
  }
}

/**
 * The given authorization code is invalid.
 */
export class InvalidAuthorizationCodeError extends Error {
  constructor() {
    super('Invalid authorization code')
  }
}
