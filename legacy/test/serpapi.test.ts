import test from 'ava'

import { SerpAPIClient } from '../src/services/serpapi'
import './_utils'

test('SerpAPIClient.search', async (t) => {
  if (!process.env.SERPAPI_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new SerpAPIClient()

  const result = await client.search('coffee')
  // console.log(result)
  t.truthy(result)
})
