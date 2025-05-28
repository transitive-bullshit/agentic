import type { Simplify } from 'type-fest'
import { assert, sanitizeSearchParams } from '@agentic/platform-core'
import {
  type Client as AuthClient,
  createClient as createAuthClient
} from '@openauthjs/openauth/client'
import defaultKy, { type KyInstance } from 'ky'

import type { operations } from './openapi'
import type {
  AuthorizeResult,
  AuthTokens,
  AuthUser,
  Deployment,
  OnUpdateAuthSessionFunction,
  Project,
  Team,
  User
} from './types'
import { subjects } from './subjects'

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
      headers: apiKey
        ? {
            Authorization: `Bearer ${apiKey}`
          }
        : undefined,

      hooks: {
        beforeRequest: [
          async (request) => {
            // Always verify freshness of auth tokens before making a request
            await this.verifyAuthAndRefreshIfNecessary()
            assert(this._authTokens, 'Not authenticated')
            request.headers.set(
              'Authorization',
              `Bearer ${this._authTokens.access}`
            )
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

  async setRefreshAuthToken(refreshToken: string): Promise<void> {
    this._ensureNoApiKey()

    const result = await this._authClient.refresh(refreshToken)
    if (result.err) {
      throw result.err
    }

    this._authTokens = result.tokens
  }

  async verifyAuthAndRefreshIfNecessary(): Promise<AuthUser> {
    this._ensureNoApiKey()

    if (!this._authTokens) {
      throw new Error('This method requires authentication.')
    }

    const verified = await this._authClient.verify(
      subjects,
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

  async getMe(): Promise<OperationResponse<'getUser'>> {
    const user = await this.verifyAuthAndRefreshIfNecessary()

    return this.ky.get(`v1/users/${user.id}`).json()
  }

  async getUser({
    userId,
    ...searchParams
  }: OperationParameters<'getUser'>): Promise<OperationResponse<'getUser'>> {
    return this.ky.get(`v1/users/${userId}`, { searchParams }).json()
  }

  async updateUser(
    user: OperationBody<'updateUser'>,
    { userId, ...searchParams }: OperationParameters<'updateUser'>
  ): Promise<OperationResponse<'updateUser'>> {
    return this.ky
      .post(`v1/users/${userId}`, { json: user, searchParams })
      .json()
  }

  async listTeams(
    searchParams: OperationParameters<'listTeams'>
  ): Promise<OperationResponse<'listTeams'>> {
    return this.ky.get('v1/teams', { searchParams }).json()
  }

  async createTeam(
    team: OperationBody<'createTeam'>,
    searchParams: OperationParameters<'createTeam'> = {}
  ): Promise<OperationResponse<'createTeam'>> {
    return this.ky.post('v1/teams', { json: team, searchParams }).json()
  }

  async getTeam({
    teamId,
    ...searchParams
  }: OperationParameters<'getTeam'>): Promise<OperationResponse<'getTeam'>> {
    return this.ky.get(`v1/teams/${teamId}`, { searchParams }).json()
  }

  async updateTeam(
    team: OperationBody<'updateTeam'>,
    { teamId, ...searchParams }: OperationParameters<'updateTeam'>
  ): Promise<OperationResponse<'updateTeam'>> {
    return this.ky
      .post(`v1/teams/${teamId}`, { json: team, searchParams })
      .json()
  }

  async deleteTeam({
    teamId,
    ...searchParams
  }: OperationParameters<'deleteTeam'>): Promise<
    OperationResponse<'deleteTeam'>
  > {
    return this.ky.delete(`v1/teams/${teamId}`, { searchParams }).json()
  }

  async createTeamMember(
    member: OperationBody<'createTeamMember'>,
    { teamId, ...searchParams }: OperationParameters<'createTeamMember'>
  ): Promise<OperationResponse<'createTeamMember'>> {
    return this.ky
      .post(`v1/teams/${teamId}/members`, { json: member, searchParams })
      .json()
  }

  async updateTeamMember(
    member: OperationBody<'updateTeamMember'>,
    { teamId, userId, ...searchParams }: OperationParameters<'updateTeamMember'>
  ): Promise<OperationResponse<'updateTeamMember'>> {
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
  }: OperationParameters<'deleteTeamMember'>): Promise<
    OperationResponse<'deleteTeamMember'>
  > {
    return this.ky
      .delete(`v1/teams/${teamId}/members/${userId}`, { searchParams })
      .json()
  }

  async listProjects<
    TPopulate extends NonNullable<
      OperationParameters<'listProjects'>['populate']
    >[number] = never
  >(
    searchParams: OperationParameters<'listProjects'> & {
      populate?: TPopulate[]
    }
  ): Promise<
    Simplify<OperationResponse<'listProjects'> & PopulateProject<TPopulate>>
  > {
    return this.ky
      .get('v1/projects', { searchParams: sanitizeSearchParams(searchParams) })
      .json()
  }

  async createProject(
    project: OperationBody<'createProject'>,
    searchParams: OperationParameters<'createProject'> = {}
  ): Promise<OperationResponse<'createProject'>> {
    return this.ky.post('v1/projects', { json: project, searchParams }).json()
  }

  async getProject<
    TPopulate extends NonNullable<
      OperationParameters<'getProject'>['populate']
    >[number] = never
  >({
    projectId,
    ...searchParams
  }: OperationParameters<'getProject'> & {
    populate?: TPopulate[]
  }): Promise<
    Simplify<OperationResponse<'getProject'> & PopulateProject<TPopulate>>
  > {
    return this.ky
      .get(`v1/projects/${projectId}`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async getProjectByIdentifier<
    TPopulate extends NonNullable<
      OperationParameters<'getProjectByIdentifier'>['populate']
    >[number] = never
  >(
    searchParams: OperationParameters<'getProjectByIdentifier'> & {
      populate?: TPopulate[]
    }
  ): Promise<
    Simplify<
      OperationResponse<'getProjectByIdentifier'> & PopulateProject<TPopulate>
    >
  > {
    return this.ky
      .get(`v1/projects/by-identifier`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async updateProject(
    project: OperationBody<'updateProject'>,
    { projectId, ...searchParams }: OperationParameters<'updateProject'>
  ): Promise<OperationResponse<'updateProject'>> {
    return this.ky
      .post(`v1/projects/${projectId}`, { json: project, searchParams })
      .json()
  }

  async getConsumer({
    consumerId,
    ...searchParams
  }: OperationParameters<'getConsumer'>): Promise<
    OperationResponse<'getConsumer'>
  > {
    return this.ky
      .get(`v1/consumers/${consumerId}`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async updateConsumer(
    consumer: OperationBody<'updateConsumer'>,
    { consumerId, ...searchParams }: OperationParameters<'updateConsumer'>
  ): Promise<OperationResponse<'updateConsumer'>> {
    return this.ky
      .post(`v1/consumers/${consumerId}`, { json: consumer, searchParams })
      .json()
  }

  async createConsumer(
    consumer: OperationBody<'createConsumer'>,
    searchParams: OperationParameters<'createConsumer'> = {}
  ): Promise<OperationResponse<'createConsumer'>> {
    return this.ky.post('v1/consumers', { json: consumer, searchParams }).json()
  }

  async refreshConsumerToken({
    consumerId,
    ...searchParams
  }: OperationParameters<'refreshConsumerToken'>): Promise<
    OperationResponse<'refreshConsumerToken'>
  > {
    return this.ky
      .post(`v1/consumers/${consumerId}/refresh-token`, { searchParams })
      .json()
  }

  async listConsumers({
    projectId,
    ...searchParams
  }: OperationParameters<'listConsumers'>): Promise<
    OperationResponse<'listConsumers'>
  > {
    return this.ky
      .get(`v1/projects/${projectId}/consumers`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async getDeployment<
    TPopulate extends NonNullable<
      OperationParameters<'getDeployment'>['populate']
    >[number] = never
  >({
    deploymentId,
    ...searchParams
  }: OperationParameters<'getDeployment'> & {
    populate?: TPopulate[]
  }): Promise<
    Simplify<OperationResponse<'getDeployment'> & PopulateDeployment<TPopulate>>
  > {
    return this.ky
      .get(`v1/deployments/${deploymentId}`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async getDeploymentByIdentifier<
    TPopulate extends NonNullable<
      OperationParameters<'getDeploymentByIdentifier'>['populate']
    >[number] = never
  >(
    searchParams: OperationParameters<'getDeploymentByIdentifier'> & {
      populate?: TPopulate[]
    }
  ): Promise<
    Simplify<
      OperationResponse<'getDeploymentByIdentifier'> &
        PopulateDeployment<TPopulate>
    >
  > {
    return this.ky
      .get(`v1/deployments/by-identifier`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async updateDeployment(
    deployment: OperationBody<'updateDeployment'>,
    { deploymentId, ...searchParams }: OperationParameters<'updateDeployment'>
  ): Promise<OperationResponse<'updateDeployment'>> {
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
    >[number] = never
  >(
    searchParams: OperationParameters<'listDeployments'> & {
      populate?: TPopulate[]
    }
  ): Promise<
    Simplify<
      OperationResponse<'listDeployments'> & PopulateDeployment<TPopulate>
    >
  > {
    return this.ky
      .get('v1/deployments', {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async createDeployment(
    deployment: OperationBody<'createDeployment'>,
    searchParams: OperationParameters<'createDeployment'> = {}
  ): Promise<OperationResponse<'createDeployment'>> {
    return this.ky
      .post('v1/deployments', { json: deployment, searchParams })
      .json()
  }

  async publishDeployment(
    deployment: OperationBody<'publishDeployment'>,
    { deploymentId, ...searchParams }: OperationParameters<'publishDeployment'>
  ): Promise<OperationResponse<'publishDeployment'>> {
    return this.ky
      .post(`v1/deployments/${deploymentId}/publish`, {
        json: deployment,
        searchParams
      })
      .json()
  }

  async adminGetConsumerByToken({
    token,
    ...searchParams
  }: OperationParameters<'adminGetConsumerByToken'>): Promise<
    OperationResponse<'adminGetConsumerByToken'>
  > {
    return this.ky
      .get(`v1/admin/consumers/tokens/${token}`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }
}

type OperationParameters<
  T extends keyof operations,
  Q = NonNullable<operations[T]['parameters']['query']>,
  P = NonNullable<operations[T]['parameters']['path']>
> = Simplify<
  ([Q] extends [never] ? unknown : Q) & ([P] extends [never] ? unknown : P)
>

type OperationResponse<T extends keyof operations> =
  operations[T]['responses'][200]['content']['application/json']

type OperationKeysWithRequestBody = {
  [K in keyof operations]: operations[K]['requestBody'] extends {
    content: {
      'application/json': unknown
    }
  }
    ? K
    : never
}[keyof operations]

type OperationBody<
  T extends OperationKeysWithRequestBody,
  B extends
    | object
    | undefined = operations[T]['requestBody']['content']['application/json']
> = B

type PopulateProject<TPopulate> = (TPopulate extends 'user'
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

type PopulateDeployment<TPopulate> = (TPopulate extends 'user'
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
