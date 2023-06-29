import test from 'ava'

import { BingWebSearchClient } from '@/services'

import { ky } from '../_utils'

test('BingWebSearchClient.search', async (t) => {
  if (!process.env.BING_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new BingWebSearchClient({ ky })

  const result = await client.search('coffee')
  // console.log(result)
  t.true(result?.webPages?.value?.length > 0)
})
