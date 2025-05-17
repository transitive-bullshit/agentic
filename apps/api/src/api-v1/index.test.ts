import type { hc } from 'hono/client'
import { expectTypeOf, test } from 'vitest'

import type { User } from '@/db'

import type { ApiRoutes } from './index'

type ApiClient = ReturnType<typeof hc<ApiRoutes>>

type GetUserResponse = Awaited<
  ReturnType<Awaited<ReturnType<ApiClient['users'][':userId']['$get']>>['json']>
>

test('User types are compatible', async () => {
  expectTypeOf<GetUserResponse>().toEqualTypeOf<User>()

  // const client = hc<ApiRoutes>('http://localhost:3000/v1')

  // const user = await client.users[':userId'].$post({
  //   param: {
  //     userId: '123'
  //   },
  //   json: {
  //     firstName: 'John'
  //   }
  // })
})
