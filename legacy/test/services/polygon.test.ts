import test from 'ava'

import { PolygonClient } from '@/services/polygon'

import { ky } from '../_utils'

test('PolygonClient.aggregates', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.aggregates({
    ticker: 'AAPL',
    from: '2023-01-01',
    to: '2023-01-03',
    multiplier: 1,
    timespan: 'day',
    limit: 1
  })
  t.is(typeof result.status, 'string', 'Status should be a string')
  t.is(typeof result.request_id, 'string', 'Request_id should be a string')
  t.is(typeof result.queryCount, 'number', 'queryCount should be a number')
  t.is(typeof result.resultsCount, 'number', 'resultsCount should be a number')
  t.is(typeof result.adjusted, 'boolean', 'adjusted should be a boolean')
  t.is(typeof result.results, 'object', 'results should be an object')
})

test('PolygonClient.dailyOpenClose', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.dailyOpenClose({
    ticker: 'AAPL',
    date: '2023-06-21'
  })
  t.truthy(result.from)
  t.is(result.symbol, 'AAPL')
})

test('PolygonClient.ema', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.ema({ ticker: 'AAPL' })
  t.truthy(result.results)
  t.true(Array.isArray(result.results.values))
})

test('PolygonClient.exchanges', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.exchanges({
    asset_class: 'stocks'
  })
  t.truthy(result.status)
  t.true(Array.isArray(result.results))
})

test('PolygonClient.groupedDaily', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.groupedDaily('stocks', { date: '2023-06-21' })
  t.truthy(result.status)
  t.true(Array.isArray(result.results))
})

test('PolygonClient.macd', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.macd({ ticker: 'AAPL' })
  t.truthy(result.results)
  t.true(Array.isArray(result.results.values))
})

test('PolygonClient.marketHolidays', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.marketHolidays()
  t.true(Array.isArray(result), 'Result should be an array')
})

test('PolygonClient.marketStatus', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.marketStatus()

  t.true(typeof result.afterHours === 'boolean')
  t.truthy(result.currencies)
  t.true(typeof result.currencies.crypto === 'string')
  t.true(typeof result.currencies.fx === 'string')
  t.true(typeof result.earlyHours === 'boolean')
  t.truthy(result.exchanges)
  t.true(typeof result.exchanges.nasdaq === 'string')
  t.true(typeof result.exchanges.nyse === 'string')
  t.true(typeof result.exchanges.otc === 'string')
  t.true(typeof result.market === 'string')
  t.true(typeof result.serverTime === 'string')
})

test('PolygonClient.previousClose', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.previousClose('AAPL')
  t.truthy(result.ticker)
  t.is(result.ticker, 'AAPL')
})

test('PolygonClient.rsi', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.rsi({ ticker: 'AAPL' })
  t.truthy(result.results)
  t.true(Array.isArray(result.results.values))
})

test('PolygonClient.sma', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.sma({ ticker: 'AAPL' })
  t.truthy(result.results)
  t.true(Array.isArray(result.results.values))
})

test('PolygonClient.tickerDetails', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.tickerDetails({ ticker: 'AAPL' })
  t.truthy(result.results)
  t.is(result.results.ticker, 'AAPL')
})

test('PolygonClient.tickerNews', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  let result = await client.tickerNews({ ticker: 'AAPL', limit: 3 })
  t.truthy(result.status)
  t.true(Array.isArray(result.results))
  t.is(result.results.length, 3)

  result = await client.tickerNews({ ticker: 'NFLX', limit: 1 })
  t.truthy(result.status)
  t.true(Array.isArray(result.results))
  t.is(result.results.length, 1)
})

test('PolygonClient.tickerTypes', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.tickerTypes()
  t.is(typeof result.status, 'string', 'Status should be a string')
  t.is(typeof result.request_id, 'string', 'Request_id should be a string')
  t.is(typeof result.count, 'number', 'Count should be a number')
})

test('PolygonClient.tickers', async (t) => {
  if (!process.env.POLYGON_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new PolygonClient({ ky })

  const result = await client.tickers({
    ticker: 'AAPL',
    limit: 1
  })
  t.is(typeof result.status, 'string', 'Status should be a string')
  t.is(typeof result.request_id, 'string', 'Request_id should be a string')
  t.is(typeof result.count, 'number', 'Count should be a number')
})
