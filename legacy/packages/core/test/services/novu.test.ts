import test from 'ava'

import { NovuClient } from '@/services/novu'

import { ky } from '../_utils'

test('NovuClient.triggerEvent', async (t) => {
  if (!process.env.NOVU_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new NovuClient({ ky })

  const result = await client.triggerEvent({
    name: 'send-email',
    payload: {
      content: 'Hello World!'
    },
    to: [
      {
        subscriberId: '123456',
        email: 'pburckhardt@outlook.com'
      }
    ]
  })
  t.truthy(result)
})
