import type { Simplify } from 'type-fest'
import { assert, getEnv, sanitizeSearchParams } from '@agentic/platform-core'
import { createAuthClient } from 'better-auth/client'
import { username } from 'better-auth/plugins'
import defaultKy, { type KyInstance } from 'ky'

import type { operations } from './openapi'
import type { AuthSession } from './types'

export class AgenticApiClient {
  static readonly DEFAULT_API_BASE_URL = 'https://api.agentic.so'

  public readonly apiBaseUrl: string
  public readonly authClient: ReturnType<typeof createAuthClient>
  public ky: KyInstance

  constructor({
    apiCookie = getEnv('AGENTIC_API_COOKIE'),
    apiBaseUrl = AgenticApiClient.DEFAULT_API_BASE_URL,
    ky = defaultKy
  }: {
    apiCookie?: string
    apiBaseUrl?: string
    ky?: KyInstance
  }) {
    assert(apiBaseUrl, 'AgenticApiClient missing required "apiBaseUrl"')
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl,
      // headers: { Authorization: `Bearer ${apiKey}` }
      headers: { cookie: apiCookie }
    })

    this.authClient = createAuthClient({
      baseURL: `${apiBaseUrl}/v1/auth`,
      plugins: [username()]
    })
  }

  async getAuthSession(cookie?: string): Promise<AuthSession> {
    return this.ky
      .get('v1/auth/get-session', cookie ? { headers: { cookie } } : {})
      .json<AuthSession>()
  }

  async setAuthSession(cookie: string): Promise<AuthSession> {
    this.ky = this.ky.extend({
      headers: { cookie }
    })

    return this.getAuthSession()
  }

  async clearAuthSession(): Promise<void> {
    this.ky = this.ky.extend({
      headers: {}
    })
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

  async listTeams({
    ...searchParams
  }: OperationParameters<'listTeams'>): Promise<
    OperationResponse<'listTeams'>
  > {
    return this.ky.get('v1/teams', { searchParams }).json()
  }

  async createTeam(
    team: OperationBody<'createTeam'>,
    { ...searchParams }: OperationParameters<'createTeam'>
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

  async listProjects({
    ...searchParams
  }: OperationParameters<'listProjects'>): Promise<
    OperationResponse<'listProjects'>
  > {
    return this.ky
      .get('v1/projects', { searchParams: sanitizeSearchParams(searchParams) })
      .json()
  }

  async createProject(
    project: OperationBody<'createProject'>,
    { ...searchParams }: OperationParameters<'createProject'>
  ): Promise<OperationResponse<'createProject'>> {
    return this.ky.post('v1/projects', { json: project, searchParams }).json()
  }

  async getProject({
    projectId,
    ...searchParams
  }: OperationParameters<'getProject'>): Promise<
    OperationResponse<'getProject'>
  > {
    return this.ky
      .get(`v1/projects/${projectId}`, {
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
    { ...searchParams }: OperationParameters<'createConsumer'>
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

  async getDeployment({
    deploymentId,
    ...searchParams
  }: OperationParameters<'getDeployment'>): Promise<
    OperationResponse<'getDeployment'>
  > {
    return this.ky
      .get(`v1/deployments/${deploymentId}`, {
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

  async listDeployments(
    searchParams: OperationParameters<'listDeployments'>
  ): Promise<OperationResponse<'listDeployments'>> {
    return this.ky
      .get('v1/deployments', {
        searchParams: sanitizeSearchParams(searchParams)
      })
      .json()
  }

  async createDeployment(
    deployment: OperationBody<'createDeployment'>,
    { ...searchParams }: OperationParameters<'createDeployment'>
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
