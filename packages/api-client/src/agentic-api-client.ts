import type {
  AdminDeployment,
  Consumer,
  Deployment,
  openapi,
  Project,
  Team,
  TeamMember,
  User
} from '@agentic/platform-types'
import type { Simplify } from 'type-fest'
import { assert, sanitizeSearchParams } from '@agentic/platform-core'
import {
  type Client as AuthClient,
  createClient as createAuthClient
} from '@openauthjs/openauth/client'
import defaultKy, { type KyInstance } from 'ky'

import type {
  AuthorizeResult,
  AuthTokens,
  AuthUser,
  OnUpdateAuthSessionFunction
} from './types'
import { authSubjects } from './auth-subjects'

export class AgenticApiClient {
  static readonly DEFAULT_API_BASE_URL = 'https://api.agentic.so'

  public readonly apiBaseUrl: string
  public readonly apiKey?: string
  public readonly ky: KyInstance
  public readonly onUpdateAuth?: OnUpdateAuthSessionFunction

  protected _authTokens?: Readonly<AuthTokens>
  protected _authClient: AuthClient

  constructor({
    apiBaseUrl = AgenticApiClient.DEFAULT_API_BASE_URL,
    apiKey,
    ky = defaultKy,
    onUpdateAuth
  }: {
    apiBaseUrl?: string
    apiKey?: string
    ky?: KyInstance
    onUpdateAuth?: OnUpdateAuthSessionFunction
  }) {
    assert(apiBaseUrl, 'AgenticApiClient missing required "apiBaseUrl"')

    this.apiBaseUrl = apiBaseUrl
    this.apiKey = apiKey
    this.onUpdateAuth = onUpdateAuth

    this._authClient = createAuthClient({
      issuer: apiBaseUrl,
      clientID: 'agentic-api-client'
    })

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl,

      // Set a longer timeout on localhost to account for backend debugging / breakpoints.
      timeout: apiBaseUrl.startsWith('http://localhost') ? 120_000 : undefined,

      headers: apiKey
        ? {
            Authorization: `Bearer ${apiKey}`
          }
        : undefined,

      hooks: {
        beforeRequest: [
          async (request) => {
            if (!this.apiKey && this._authTokens) {
              // Always verify freshness of auth tokens before making a request
              await this.verifyAuthAndRefreshIfNecessary()
              assert(this._authTokens, 'Not authenticated')
              request.headers.set(
                'Authorization',
                `Bearer ${this._authTokens.access}`
              )
            }
          }
        ]
      }
    })
  }

  get isAuthenticated(): boolean {
    return !!this._authTokens
  }

  get authTokens(): Readonly<AuthTokens> | undefined {
    return this._authTokens
  }

  async setAuth(tokens: AuthTokens): Promise<AuthUser> {
    this._ensureNoApiKey()

    this._authTokens = tokens
    return this.verifyAuthAndRefreshIfNecessary()
  }

  async verifyAuthAndRefreshIfNecessary(): Promise<AuthUser> {
    this._ensureNoApiKey()

    if (!this._authTokens) {
      throw new Error('This method requires authentication.')
    }

    const verified = await this._authClient.verify(
      authSubjects,
      this._authTokens.access,
      {
        refresh: this._authTokens.refresh
      }
    )

    if (verified.err) {
      throw verified.err
    }

    if (verified.tokens) {
      this._authTokens = verified.tokens
    }

    this.onUpdateAuth?.({
      session: this._authTokens,
      user: verified.subject.properties
    })

    return verified.subject.properties
  }

  async exchangeAuthCode({
    code,
    redirectUri,
    verifier
  }: {
    code: string
    redirectUri: string
    verifier?: string
  }): Promise<AuthUser> {
    this._ensureNoApiKey()
    const result = await this._authClient.exchange(code, redirectUri, verifier)

    if (result.err) {
      throw result.err
    }

    this._authTokens = result.tokens
    return this.verifyAuthAndRefreshIfNecessary()
  }

  async initAuthFlow({
    redirectUri,
    provider
  }: {
    redirectUri: string
    provider: 'github' | 'password'
  }): Promise<AuthorizeResult> {
    this._ensureNoApiKey()

    return this._authClient.authorize(redirectUri, 'code', {
      provider
    })
  }

  async logout(): Promise<void> {
    this._authTokens = undefined
    this.onUpdateAuth?.()
  }

  protected _ensureNoApiKey() {
    assert(
      !this.apiKey,
      'AgenticApiClient was initialized with an API key. This method is only supported with wnon-API-key-based authentication.'
    )
  }

  async getMe(): Promise<User> {
    const user = await this.verifyAuthAndRefreshIfNecessary()

    return this.ky.get(`v1/users/${user.id}`).json()
  }

  async getUser({
    userId,
    ...searchParams
  }: OperationParameters<'getUser'>): Promise<User> {
    return this.ky.get(`v1/users/${userId}`, { searchParams }).json()
  }

  async updateUser(
    user: OperationBody<'updateUser'>,
    { userId, ...searchParams }: OperationParameters<'updateUser'>
  ): Promise<User> {
    return this.ky
      .post(`v1/users/${userId}`, { json: user, searchParams })
      .json()
  }

  async listTeams(
    searchParams: OperationParameters<'listTeams'>
  ): Promise<Array<Team>> {
    return this.ky.get('v1/teams', { searchParams }).json()
  }

  async createTeam(
    team: OperationBody<'createTeam'>,
    searchParams: OperationParameters<'createTeam'> = {}
  ): Promise<Team> {
    return this.ky.post('v1/teams', { json: team, searchParams }).json()
  }

  async getTeam({
    teamId,
    ...searchParams
  }: OperationParameters<'getTeam'>): Promise<Team> {
    return this.ky.get(`v1/teams/${teamId}`, { searchParams }).json()
  }

  async updateTeam(
    team: OperationBody<'updateTeam'>,
    { teamId, ...searchParams }: OperationParameters<'updateTeam'>
  ): Promise<Team> {
    return this.ky
      .post(`v1/teams/${teamId}`, { json: team, searchParams })
      .json()
  }

  async deleteTeam({
    teamId,
    ...searchParams
  }: OperationParameters<'deleteTeam'>): Promise<Team> {
    return this.ky.delete(`v1/teams/${teamId}`, { searchParams }).json()
  }

  async createTeamMember(
    member: OperationBody<'createTeamMember'>,
    { teamId, ...searchParams }: OperationParameters<'createTeamMember'>
  ): Promise<TeamMember> {
    return this.ky
      .post(`v1/teams/${teamId}/members`, { json: member, searchParams })
      .json()
  }

  async updateTeamMember(
    member: OperationBody<'updateTeamMember'>,
    { teamId, userId, ...searchParams }: OperationParameters<'updateTeamMember'>
  ): Promise<TeamMember> {
    return this.ky
      .post(`v1/teams/${teamId}/members/${userId}`, {
        json: member,
        searchParams
      })
      .json()
  }

  async deleteTeamMember({
    teamId,
    userId,
    ...searchParams
  }: OperationParameters<'deleteTeamMember'>): Promise<TeamMember> {
    return this.ky
      .delete(`v1/teams/${teamId}/members/${userId}`, { searchParams })
      .json()
  }

  async listProjects<
    TPopulate extends NonNullable<
      OperationParameters<'listProjects'>['populate']
    >[number]
  >(
    searchParams: OperationParameters<'listProjects'> & {
      populate?: TPopulate[]
    }
  ): Promise<Array<PopulateProject<TPopulate>>> {
    return this.ky
      .get('v1/projects', { searchParams: sanitizeSearchParams(searchParams) })
      .json()
  }

  async createProject(
    project: OperationBody<'createProject'>,
    searchParams: OperationParameters<'createProject'> = {}
  ): Promise<Project> {
    return this.ky.post('v1/projects', { json: project, searchParams }).json()
  }

  async getProject<
    TPopulate extends NonNullable<
      OperationParameters<'getProject'>['populate']
    >[number]
  >({
    projectId,
    ...searchParams
  }: OperationParameters<'getProject'> & {
    populate?: TPopulate[]
  }): Promise<PopulateProject<TPopulate>> {
    return this.ky
      .get(`v1/projects/${projectId}`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async getProjectByIdentifier<
    TPopulate extends NonNullable<
      OperationParameters<'getProjectByIdentifier'>['populate']
    >[number]
  >(
    searchParams: OperationParameters<'getProjectByIdentifier'> & {
      populate?: TPopulate[]
    }
  ): Promise<PopulateProject<TPopulate>> {
    return this.ky
      .get(`v1/projects/by-identifier`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async updateProject(
    project: OperationBody<'updateProject'>,
    { projectId, ...searchParams }: OperationParameters<'updateProject'>
  ): Promise<Project> {
    return this.ky
      .post(`v1/projects/${projectId}`, { json: project, searchParams })
      .json()
  }

  async getConsumer<
    TPopulate extends NonNullable<
      OperationParameters<'getConsumer'>['populate']
    >[number]
  >({
    consumerId,
    ...searchParams
  }: OperationParameters<'getConsumer'> & {
    populate?: TPopulate[]
  }): Promise<PopulateConsumer<TPopulate>> {
    return this.ky
      .get(`v1/consumers/${consumerId}`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async updateConsumer(
    consumer: OperationBody<'updateConsumer'>,
    { consumerId, ...searchParams }: OperationParameters<'updateConsumer'>
  ): Promise<Consumer> {
    return this.ky
      .post(`v1/consumers/${consumerId}`, { json: consumer, searchParams })
      .json()
  }

  async createConsumer(
    consumer: OperationBody<'createConsumer'>,
    searchParams: OperationParameters<'createConsumer'> = {}
  ): Promise<Consumer> {
    return this.ky.post('v1/consumers', { json: consumer, searchParams }).json()
  }

  async refreshConsumerToken({
    consumerId,
    ...searchParams
  }: OperationParameters<'refreshConsumerToken'>): Promise<Consumer> {
    return this.ky
      .post(`v1/consumers/${consumerId}/refresh-token`, { searchParams })
      .json()
  }

  async listConsumers<
    TPopulate extends NonNullable<
      OperationParameters<'listConsumers'>['populate']
    >[number]
  >({
    projectId,
    ...searchParams
  }: OperationParameters<'listConsumers'> & {
    populate?: TPopulate[]
  }): Promise<Array<PopulateConsumer<TPopulate>>> {
    return this.ky
      .get(`v1/projects/${projectId}/consumers`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async getDeployment<
    TPopulate extends NonNullable<
      OperationParameters<'getDeployment'>['populate']
    >[number]
  >({
    deploymentId,
    ...searchParams
  }: OperationParameters<'getDeployment'> & {
    populate?: TPopulate[]
  }): Promise<PopulateDeployment<TPopulate>> {
    return this.ky
      .get(`v1/deployments/${deploymentId}`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async getDeploymentByIdentifier<
    TPopulate extends NonNullable<
      OperationParameters<'getDeploymentByIdentifier'>['populate']
    >[number]
  >(
    searchParams: OperationParameters<'getDeploymentByIdentifier'> & {
      populate?: TPopulate[]
    }
  ): Promise<PopulateDeployment<TPopulate>> {
    return this.ky
      .get(`v1/deployments/by-identifier`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async updateDeployment(
    deployment: OperationBody<'updateDeployment'>,
    { deploymentId, ...searchParams }: OperationParameters<'updateDeployment'>
  ): Promise<Deployment> {
    return this.ky
      .post(`v1/deployments/${deploymentId}`, {
        json: deployment,
        searchParams
      })
      .json()
  }

  async listDeployments<
    TPopulate extends NonNullable<
      OperationParameters<'listDeployments'>['populate']
    >[number]
  >(
    searchParams: OperationParameters<'listDeployments'> & {
      populate?: TPopulate[]
    }
  ): Promise<Array<PopulateDeployment<TPopulate>>> {
    return this.ky
      .get('v1/deployments', {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async createDeployment(
    deployment: OperationBody<'createDeployment'>,
    searchParams: OperationParameters<'createDeployment'> = {}
  ): Promise<Deployment> {
    return this.ky
      .post('v1/deployments', { json: deployment, searchParams })
      .json()
  }

  async publishDeployment(
    deployment: OperationBody<'publishDeployment'>,
    { deploymentId, ...searchParams }: OperationParameters<'publishDeployment'>
  ): Promise<Deployment> {
    return this.ky
      .post(`v1/deployments/${deploymentId}/publish`, {
        json: deployment,
        searchParams
      })
      .json()
  }

  async adminGetConsumerByToken<
    TPopulate extends NonNullable<
      OperationParameters<'adminGetConsumerByToken'>['populate']
    >[number]
  >({
    token,
    ...searchParams
  }: OperationParameters<'adminGetConsumerByToken'> & {
    populate?: TPopulate[]
  }): Promise<PopulateConsumer<TPopulate>> {
    return this.ky
      .get(`v1/admin/consumers/tokens/${token}`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async adminGetDeploymentByIdentifier<
    TPopulate extends NonNullable<
      OperationParameters<'adminGetDeploymentByIdentifier'>['populate']
    >[number]
  >(
    searchParams: OperationParameters<'adminGetDeploymentByIdentifier'> & {
      populate?: TPopulate[]
    }
  ): Promise<PopulateDeployment<TPopulate, AdminDeployment>> {
    return this.ky
      .get(`v1/admin/deployments/by-identifier`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }
}

type Operations = openapi.operations

type OperationParameters<
  T extends keyof Operations,
  Q = NonNullable<Operations[T]['parameters']['query']>,
  P = NonNullable<Operations[T]['parameters']['path']>
> = Simplify<
  ([Q] extends [never] ? unknown : Q) & ([P] extends [never] ? unknown : P)
>

// Currently unused because some types need customization (e.g. Deployment) over
// the default OpenAPI types.
// type OperationResponse<T extends keyof Operations> =
//   Operations[T]['responses'][200]['content']['application/json']

type OperationKeysWithRequestBody = {
  [K in keyof Operations]: Operations[K]['requestBody'] extends {
    content: {
      'application/json': unknown
    }
  }
    ? K
    : never
}[keyof Operations]

type OperationBody<
  T extends OperationKeysWithRequestBody,
  B extends
    | object
    | undefined = Operations[T]['requestBody']['content']['application/json']
> = B

type PopulateProject<TPopulate> = Simplify<
  Project &
    (TPopulate extends 'user'
      ? {
          user: User
        }
      : unknown) &
    (TPopulate extends 'team'
      ? {
          team: Team
        }
      : unknown) &
    (TPopulate extends 'lastPublishedDeployment'
      ? {
          lastPublishedDeployment?: Deployment
        }
      : unknown) &
    (TPopulate extends 'lastDeployment'
      ? {
          lastDeployment?: Deployment
        }
      : unknown)
>

type PopulateDeployment<
  TPopulate,
  TDeployment extends Deployment = Deployment
> = Simplify<
  TDeployment &
    (TPopulate extends 'user'
      ? {
          user: User
        }
      : unknown) &
    (TPopulate extends 'team'
      ? {
          team: Team
        }
      : unknown) &
    (TPopulate extends 'project'
      ? {
          project: Project
        }
      : unknown)
>

type PopulateConsumer<TPopulate> = Simplify<
  Consumer &
    (TPopulate extends 'user'
      ? {
          user: User
        }
      : unknown) &
    (TPopulate extends 'project'
      ? {
          project: Project
        }
      : unknown) &
    (TPopulate extends 'deployment'
      ? {
          deployment: Deployment
        }
      : unknown)
>
