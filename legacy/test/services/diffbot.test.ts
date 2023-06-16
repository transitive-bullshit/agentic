import test from 'ava'

import { DiffbotClient } from '@/services'

import { isCI, ky } from '../_utils'

test('Diffbot.extractAnalyze', async (t) => {
  if (!process.env.DIFFBOT_API_KEY || isCI) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new DiffbotClient({ ky })

  const result = await client.extractAnalyze({
    url: 'https://transitivebullsh.it'
  })
  // console.log(result)
  t.is(result.type, 'list')
  t.is(result.objects?.length, 1)
})

test('Diffbot.extractArticle', async (t) => {
  if (!process.env.DIFFBOT_API_KEY || isCI) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new DiffbotClient({ ky })

  const result = await client.extractArticle({
    url: 'https://www.nytimes.com/2023/05/31/magazine/ai-start-up-accelerator-san-francisco.html'
    // fields: ['meta']
  })
  // console.log(JSON.stringify(result, null, 2))
  t.is(result.objects[0].type, 'article')
})

test('Diffbot.knowledgeGraphSearch', async (t) => {
  if (!process.env.DIFFBOT_API_KEY || isCI) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new DiffbotClient({ ky })

  const result = await client.knowledgeGraphSearch({
    type: 'query',
    query: 'Brown University',
    size: 10
  })
  // console.log(JSON.stringify(result, null, 2))
  t.true(Array.isArray(result.data))
  t.is(result.data.length, 10)
})

test('Diffbot.knowledgeGraphEnhance', async (t) => {
  if (!process.env.DIFFBOT_API_KEY || isCI) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new DiffbotClient({ ky })

  const result = await client.knowledgeGraphEnhance({
    type: 'Person',
    name: 'Travis Fischer',
    url: 'https://transitivebullsh.it'
  })
  // console.log(JSON.stringify(result, null, 2))
  t.is(result.data[0]?.entity?.githubUri, 'github.com/transitive-bullshit')
})
