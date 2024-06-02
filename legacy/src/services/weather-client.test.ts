import { expect, test } from 'vitest'

import { WeatherClient } from './weather-client.js'

test('WeatherClient.functions', () => {
  const weather = new WeatherClient({
    apiKey: 'sk-test'
  })

  const fns = [...weather.functions]
  console.log(fns)

  expect(weather.functions.get('getCurrentWeather')).toBeTruthy()
})
