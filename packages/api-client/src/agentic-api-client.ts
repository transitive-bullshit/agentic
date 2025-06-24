import type {
  AdminConsumer,
  AdminDeployment,
  AuthSession,
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
import defaultKy, { type KyInstance } from 'ky'

import type { OnUpdateAuthSessionFunction } from './types'

export class AgenticApiClient {
  static readonly DEFAULT_API_BASE_URL = 'https://api.agentic.so'

  public readonly apiBaseUrl: string
  public readonly apiKey?: string
  public readonly ky: KyInstance
  public readonly onUpdateAuth?: OnUpdateAuthSessionFunction

  // protected _authClient: AuthClient
  protected _authSession?: AuthSession

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
  } = {}) {
    assert(apiBaseUrl, 'AgenticApiClient missing required "apiBaseUrl"')

    this.apiBaseUrl = apiBaseUrl
    this.apiKey = apiKey
    this.onUpdateAuth = onUpdateAuth

    // this._authClient = createAuthClient({
    //   issuer: apiBaseUrl,
    //   clientId: 'agentic-api-client'
    // })

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
            if (!this.apiKey && this._authSession) {
              // Always verify freshness of auth tokens before making a request
              // TODO: handle refreshing auth tokens
              // await this.verifyAuthAndRefreshIfNecessary()
              // assert(this._authSession, 'Not authenticated')

              request.headers.set(
                'Authorization',
                `Bearer ${this._authSession.token}`
              )
            }
          }
        ]
      }
    })
  }

  get isAuthenticated(): boolean {
    return !!this._authSession
  }

  get authSession(): AuthSession | undefined {
    return structuredClone(this._authSession)
  }

  set authSession(authSession: AuthSession | undefined) {
    // TODO: validate auth sessino with zod
    this._authSession = structuredClone(authSession)
  }

  // async verifyAuthAndRefreshIfNecessary(): Promise<AuthSession> {
  //   this._ensureNoApiKey()

  //   if (!this._authTokens) {
  //     throw new Error('This method requires authentication.')
  //   }

  //   const verified = await this._authClient.verify(
  //     authSubjects,
  //     this._authTokens.access,
  //     {
  //       refresh: this._authTokens.refresh
  //     }
  //   )

  //   if (verified.err) {
  //     throw verified.err
  //   }

  //   if (verified.tokens) {
  //     this._authTokens = verified.tokens
  //   }

  //   this.onUpdateAuth?.({
  //     session: this._authTokens,
  //     user: verified.subject.properties
  //   })

  //   return verified.subject.properties
  // }

  // async exchangeAuthCode({
  //   code,
  //   redirectUri,
  //   verifier
  // }: {
  //   code: string
  //   redirectUri: string
  //   verifier?: string
  // }): Promise<AuthSession> {
  //   this._ensureNoApiKey()
  //   const result = await this._authClient.exchange(code, redirectUri, verifier)

  //   if (result.err) {
  //     throw result.err
  //   }

  //   this._authTokens = result.tokens
  //   return this.verifyAuthAndRefreshIfNecessary()
  // }

  // async initAuthFlow({
  //   redirectUri,
  //   provider
  // }: {
  //   redirectUri: string
  //   provider: 'github'
  // }): Promise<AuthorizeResult> {
  //   this._ensureNoApiKey()

  //   return this._authClient.authorize(redirectUri, 'code', {
  //     provider
  //   })
  // }

  async logout(): Promise<void> {
    this._authSession = undefined
    this.onUpdateAuth?.()
  }

  protected _ensureNoApiKey() {
    assert(
      !this.apiKey,
      'AgenticApiClient was initialized with an API key. This method is only supported with wnon-API-key-based authentication.'
    )
  }

  /** Signs in with email + password. */
  async signInWithPassword(
    json: OperationBody<'signInWithPassword'>
    // searchParams?: OperationParameters<'signInWithPassword'>
  ): Promise<AuthSession> {
    this._authSession = await this.ky
      .post('v1/auth/password/signin', { json })
      .json<AuthSession>()

    this.onUpdateAuth?.(this._authSession)
    return this._authSession
  }

  /** Registers a new account with username + email + password. */
  async signUpWithPassword(
    json: OperationBody<'signUpWithPassword'>
    // searchParams?: OperationParameters<'signUpWithPassword'>
  ): Promise<AuthSession> {
    this._authSession = await this.ky
      .post('v1/auth/password/signup', { json })
      .json()

    this.onUpdateAuth?.(this._authSession)
    return this._authSession
  }

  // TODO
  async initAuthFlowWithGitHub({
    redirectUri,
    scope = 'user:email',
    clientId = 'Iv23lizZv3CnggDT7JED'
  }: {
    redirectUri: string
    scope?: string
    clientId?: string
  }): Promise<string> {
    const url = new URL(`${this.apiBaseUrl}/v1/auth/github/init`)
    url.searchParams.append('client_id', clientId)
    url.searchParams.append('scope', scope)
    url.searchParams.append('redirect_uri', redirectUri)

    return url.toString()
  }

  // TODO
  async exchangeOAuthCodeWithGitHub(
    json: OperationBody<'exchangeOAuthCodeWithGitHub'>
  ): Promise<AuthSession> {
    this._authSession = await this.ky
      .post('v1/auth/github/exchange', { json })
      .json()

    this.onUpdateAuth?.(this._authSession)
    return this._authSession
  }

  /** Gets the currently authenticated user. */
  async getMe(): Promise<User> {
    // const user = await this.verifyAuthAndRefreshIfNecessary()
    const userId = this._authSession?.user.id
    assert(userId, 'This method requires authentication.')

    return this.ky.get(`v1/users/${userId}`).json()
  }

  /** Gets a user by ID. */
  async getUser({
    userId,
    ...searchParams
  }: OperationParameters<'getUser'>): Promise<User> {
    return this.ky.get(`v1/users/${userId}`, { searchParams }).json()
  }

  /** Updates a user. */
  async updateUser(
    user: OperationBody<'updateUser'>,
    { userId, ...searchParams }: OperationParameters<'updateUser'>
  ): Promise<User> {
    return this.ky
      .post(`v1/users/${userId}`, { json: user, searchParams })
      .json()
  }

  /** Lists all teams the authenticated user belongs to. */
  async listTeams(
    searchParams: OperationParameters<'listTeams'> = {}
  ): Promise<Array<Team>> {
    return this.ky
      .get('v1/teams', { searchParams: sanitizeSearchParams(searchParams) })
      .json()
  }

  /** Creates a team. */
  async createTeam(
    team: OperationBody<'createTeam'>,
    searchParams: OperationParameters<'createTeam'> = {}
  ): Promise<Team> {
    return this.ky
      .post('v1/teams', {
        json: team,
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /** Gets a team by ID. */
  async getTeam({
    teamId,
    ...searchParams
  }: OperationParameters<'getTeam'>): Promise<Team> {
    return this.ky.get(`v1/teams/${teamId}`, { searchParams }).json()
  }

  /** Updates a team. */
  async updateTeam(
    team: OperationBody<'updateTeam'>,
    { teamId, ...searchParams }: OperationParameters<'updateTeam'>
  ): Promise<Team> {
    return this.ky
      .post(`v1/teams/${teamId}`, { json: team, searchParams })
      .json()
  }

  /** Deletes a team by ID. */
  async deleteTeam({
    teamId,
    ...searchParams
  }: OperationParameters<'deleteTeam'>): Promise<Team> {
    return this.ky.delete(`v1/teams/${teamId}`, { searchParams }).json()
  }

  /** Creates a new team member. */
  async createTeamMember(
    member: OperationBody<'createTeamMember'>,
    { teamId, ...searchParams }: OperationParameters<'createTeamMember'>
  ): Promise<TeamMember> {
    return this.ky
      .post(`v1/teams/${teamId}/members`, { json: member, searchParams })
      .json()
  }

  /** Updates a team member. */
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

  /** Deletes a team member. */
  async deleteTeamMember({
    teamId,
    userId,
    ...searchParams
  }: OperationParameters<'deleteTeamMember'>): Promise<TeamMember> {
    return this.ky
      .delete(`v1/teams/${teamId}/members/${userId}`, { searchParams })
      .json()
  }

  /** Lists projects that have been published publicly to the marketplace. */
  async listPublicProjects<
    TPopulate extends NonNullable<
      OperationParameters<'listPublicProjects'>['populate']
    >[number]
  >(
    searchParams: OperationParameters<'listPublicProjects'> & {
      populate?: TPopulate[]
    } = {}
  ): Promise<Array<PopulateProject<TPopulate>>> {
    return this.ky
      .get('v1/projects/public', {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /**
   * Gets a public project by ID. The project must be publicly available on
   * the marketplace.
   */
  async getPublicProject<
    TPopulate extends NonNullable<
      OperationParameters<'getPublicProject'>['populate']
    >[number]
  >({
    projectId,
    ...searchParams
  }: OperationParameters<'getPublicProject'> & {
    populate?: TPopulate[]
  }): Promise<PopulateProject<TPopulate>> {
    return this.ky
      .get(`v1/projects/public/${projectId}`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /**
   * Gets a public project by its identifier. The project must be publicly
   * available on the marketplace.
   */
  async getPublicProjectByIdentifier<
    TPopulate extends NonNullable<
      OperationParameters<'getPublicProjectByIdentifier'>['populate']
    >[number]
  >(
    searchParams: OperationParameters<'getPublicProjectByIdentifier'> & {
      populate?: TPopulate[]
    }
  ): Promise<PopulateProject<TPopulate>> {
    return this.ky
      .get('v1/projects/public/by-identifier', {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /**
   * Lists projects the authenticated user has access to.
   */
  async listProjects<
    TPopulate extends NonNullable<
      OperationParameters<'listProjects'>['populate']
    >[number]
  >(
    searchParams: OperationParameters<'listProjects'> & {
      populate?: TPopulate[]
    } = {}
  ): Promise<Array<PopulateProject<TPopulate>>> {
    return this.ky
      .get(`v1/projects`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /** Creates a new project. */
  async createProject(
    project: OperationBody<'createProject'>,
    searchParams: OperationParameters<'createProject'> = {}
  ): Promise<Project> {
    return this.ky.post('v1/projects', { json: project, searchParams }).json()
  }

  /**
   * Gets a project by ID. Authenticated user must have access to the project.
   */
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

  /**
   * Gets a project by its identifier. Authenticated user must have access to
   * the project.
   */
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

  /**
   * Updates a project. Authenticated user must have access to the project.
   */
  async updateProject(
    project: OperationBody<'updateProject'>,
    { projectId, ...searchParams }: OperationParameters<'updateProject'>
  ): Promise<Project> {
    return this.ky
      .post(`v1/projects/${projectId}`, { json: project, searchParams })
      .json()
  }

  /** Gets a consumer by ID. */
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

  /** Gets a consumer by ID. */
  async getConsumerByProjectIdentifier<
    TPopulate extends NonNullable<
      OperationParameters<'getConsumerByProjectIdentifier'>['populate']
    >[number]
  >(
    searchParams: OperationParameters<'getConsumerByProjectIdentifier'> & {
      populate?: TPopulate[]
    }
  ): Promise<PopulateConsumer<TPopulate>> {
    return this.ky
      .get(`v1/consumers/by-project-identifier`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /**
   * Updates a consumer's subscription to a different deployment or pricing
   * plan. Set `plan` to undefined to cancel the subscription.
   */
  async updateConsumer(
    consumer: OperationBody<'updateConsumer'>,
    { consumerId, ...searchParams }: OperationParameters<'updateConsumer'>
  ): Promise<Consumer> {
    return this.ky
      .post(`v1/consumers/${consumerId}`, { json: consumer, searchParams })
      .json()
  }

  /**
   * Creates a new consumer by subscribing a customer to a project.
   *
   * @deprecated Use `createConsumerCheckoutSession` instead. This method will
   * be removed in a future version.
   */
  async createConsumer(
    consumer: OperationBody<'createConsumer'>,
    searchParams: OperationParameters<'createConsumer'> = {}
  ): Promise<Consumer> {
    return this.ky
      .post('v1/consumers', {
        json: consumer,
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /**
   * Creates a Stripe Checkout Session for a customer to modify their
   * subscription to a project.
   */
  async createConsumerCheckoutSession(
    consumer: OperationBody<'createConsumerCheckoutSession'>,
    searchParams: OperationParameters<'createConsumerCheckoutSession'> = {}
  ): Promise<{
    checkoutSession: {
      id: string
      url: string
    }
    consumer: Consumer
  }> {
    return this.ky
      .post('v1/consumers/checkout', {
        json: consumer,
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /**
   * Creates a Stripe Billing Portal Session for the authenticated user.
   */
  async createBillingPortalSession(
    searchParams: OperationParameters<'createBillingPortalSession'> = {}
  ): Promise<{
    url: string
  }> {
    return this.ky
      .post(`v1/consumers/billing-portal`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /**
   * Creates a Stripe Billing Portal Session for a customer.
   */
  async createConsumerBillingPortalSession({
    consumerId,
    ...searchParams
  }: OperationParameters<'createConsumerBillingPortalSession'>): Promise<{
    url: string
  }> {
    return this.ky
      .post(`v1/consumers/${consumerId}/billing-portal`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /** Refreshes a consumer's API token. */
  async refreshConsumerToken({
    consumerId,
    ...searchParams
  }: OperationParameters<'refreshConsumerToken'>): Promise<Consumer> {
    return this.ky
      .post(`v1/consumers/${consumerId}/refresh-token`, { searchParams })
      .json()
  }

  /** Lists all of the customers. */
  async listConsumers<
    TPopulate extends NonNullable<
      OperationParameters<'listConsumers'>['populate']
    >[number]
  >(
    searchParams: OperationParameters<'listConsumers'> & {
      populate?: TPopulate[]
    } = {}
  ): Promise<Array<PopulateConsumer<TPopulate>>> {
    return this.ky
      .get('v1/consumers', {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /** Lists all of the customers for a project. */
  async listConsumersForProject<
    TPopulate extends NonNullable<
      OperationParameters<'listConsumersForProject'>['populate']
    >[number]
  >({
    projectId,
    ...searchParams
  }: OperationParameters<'listConsumersForProject'> & {
    populate?: TPopulate[]
  }): Promise<Array<PopulateConsumer<TPopulate>>> {
    return this.ky
      .get(`v1/projects/${projectId}/consumers`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /** Gets a deployment by its ID. */
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

  /** Gets a deployment by its identifier. */
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

  /** Gets a public deployment by its identifier. */
  async getPublicDeploymentByIdentifier<
    TPopulate extends NonNullable<
      OperationParameters<'getPublicDeploymentByIdentifier'>['populate']
    >[number]
  >(
    searchParams: OperationParameters<'getPublicDeploymentByIdentifier'> & {
      populate?: TPopulate[]
    }
  ): Promise<PopulateDeployment<TPopulate>> {
    return this.ky
      .get(`v1/deployments/public/by-identifier`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /** Updates a deployment. */
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

  /**
   * Lists deployments the user or team has access to, optionally filtering by
   * project.
   */
  async listDeployments<
    TPopulate extends NonNullable<
      OperationParameters<'listDeployments'>['populate']
    >[number]
  >(
    searchParams: OperationParameters<'listDeployments'> & {
      populate?: TPopulate[]
    } = {}
  ): Promise<Array<PopulateDeployment<TPopulate>>> {
    return this.ky
      .get('v1/deployments', {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /** Creates a new deployment within a project. */
  async createDeployment(
    deployment: OperationBody<'createDeployment'>,
    searchParams: OperationParameters<'createDeployment'> = {}
  ): Promise<Deployment> {
    return this.ky
      .post('v1/deployments', { json: deployment, searchParams })
      .json()
  }

  /** Publishes a deployment. */
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

  /**
   * Gets a consumer by API token. This method is admin-only.
   *
   * @internal
   */
  async adminGetConsumerByToken<
    TPopulate extends NonNullable<
      OperationParameters<'adminGetConsumerByToken'>['populate']
    >[number]
  >({
    token,
    ...searchParams
  }: OperationParameters<'adminGetConsumerByToken'> & {
    populate?: TPopulate[]
  }): Promise<PopulateConsumer<TPopulate, AdminConsumer>> {
    return this.ky
      .get(`v1/admin/consumers/tokens/${token}`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /**
   * Activates a consumer signifying that at least one API call has been made
   * using the consumer's API token. This method is idempotent and admin-only.
   *
   * @internal
   */
  async adminActivateConsumer({
    consumerId,
    ...searchParams
  }: OperationParameters<'adminActivateConsumer'>): Promise<AdminConsumer> {
    return this.ky
      .put(`v1/admin/consumers/${consumerId}/activate`, {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  /**
   * Gets a deployment by its public identifier. This method is admin-only.
   *
   * @internal
   */
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

type PopulateConsumer<
  TPopulate,
  TConsumer extends Consumer = Consumer
> = Simplify<
  TConsumer &
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
