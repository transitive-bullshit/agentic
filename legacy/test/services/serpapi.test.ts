import test from 'ava'

import { SerpAPIClient } from '@/services/serpapi'

import { ky } from '../_utils'

test('SerpAPIClient.search - coffee', async (t) => {
  if (!process.env.SERPAPI_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new SerpAPIClient({ ky })

  const result = await client.search('coffee')
  // console.log(JSON.stringify(result, null, 2))
  t.truthy(result.organic_results)
})

test('SerpAPIClient.search - answer box', async (t) => {
  if (!process.env.SERPAPI_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new SerpAPIClient({ ky })

  const result = await client.search(
    'how many planets are there in the milky way?'
  )
  // console.log(JSON.stringify(result, null, 2))
  t.truthy(result.answer_box)
})
