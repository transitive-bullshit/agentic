import test from 'ava'

import { WeatherClient } from '@/services'

import { ky } from '../_utils'

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
