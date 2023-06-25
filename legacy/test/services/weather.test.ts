import test from 'ava'

import { WeatherClient } from '@/services/weather'
import { WeatherTool } from '@/tools/weather'

import { createTestAgenticRuntime, ky } from '../_utils'

test('WeatherClient.getCurrentWeather', async (t) => {
  if (!process.env.WEATHER_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new WeatherClient({ ky })

  const result = await client.getCurrentWeather('Seattle')
  // console.log(result)
  t.truthy(result.current)
  t.truthy(result.location)
})

test('WeatherClient.ipInfo', async (t) => {
  if (!process.env.WEATHER_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const client = new WeatherClient({ ky })

  const res = await client.ipInfo('52.119.125.215')
  t.truthy(res.ip)
  t.truthy(res.city)
  t.truthy(res.lat)
  t.truthy(res.lon)
})

test('WeatherTool.call', async (t) => {
  if (!process.env.WEATHER_API_KEY) {
    return t.pass()
  }

  t.timeout(2 * 60 * 1000)
  const agentic = createTestAgenticRuntime()
  const weatherClient = new WeatherClient({ ky })
  const tool = new WeatherTool({ agentic, weather: weatherClient })

  const result = await tool.call({ query: '11201' })
  // console.log(result)
  t.truthy(result.current)
  t.truthy(result.location)
  t.is(result.location!.name, 'Brooklyn')
  t.is(result.location!.region, 'New York')
  t.is(result.location!.country, 'USA')
})
