import test from 'ava'

import { PolygonClient } from '@/services/polygon'

import { ky } from '../_utils'

test('PolygonClient.getTickerDetails', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.getTickerDetails({ ticker: 'AAPL' })
  t.truthy(result.results)
  t.is(result.results.ticker, 'AAPL')
})

test('PolygonClient.getDailyOpenClose', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.getDailyOpenClose({
    ticker: 'AAPL',
    date: '2023-06-21'
  })
  t.truthy(result.from)
  t.is(result.symbol, 'AAPL')
})

test('PolygonClient.getPreviousClose', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.getPreviousClose('AAPL')
  t.truthy(result.ticker)
  t.is(result.ticker, 'AAPL')
})
