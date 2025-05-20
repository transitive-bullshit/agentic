import type { Simplify } from 'type-fest'
import defaultKy, { type KyInstance } from 'ky'

import type { operations } from './openapi'
import { getEnv } from './utils'

export class AgenticApiClient {
  ky: KyInstance

  constructor({
    apiKey = getEnv('AGENTIC_API_KEY'),
    ky = defaultKy
  }: {
    apiKey?: string
    ky?: KyInstance
  }) {
    this.ky = ky.extend({ headers: { Authorization: `Bearer ${apiKey}` } })
  }

  async getUser({
    userId,
    ...searchParams
  }: OperationParameters<'getUser'>): Promise<OperationResponse<'getUser'>> {
    return this.ky.get(`/v1/users/${userId}`, { searchParams }).json()
  }

  async updateUser(
    user: OperationBody<'updateUser'>,
    { userId, ...searchParams }: OperationParameters<'updateUser'>
  ): Promise<OperationResponse<'updateUser'>> {
    return this.ky
      .post(`/v1/users/${userId}`, { json: user, searchParams })
      .json()
  }
}

type OperationParameters<
  T extends keyof operations,
  Q extends object | undefined = operations[T]['parameters']['query'],
  P extends object | undefined = operations[T]['parameters']['path']
> = Simplify<
  (Q extends never | undefined ? unknown : Q) &
    (P extends never | undefined ? unknown : P)
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
