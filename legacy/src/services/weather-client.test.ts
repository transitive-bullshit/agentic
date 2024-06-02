import { expect, test } from 'vitest'

import { WeatherClient } from './weather-client.js'

test('WeatherClient.functions', () => {
  const weather = new WeatherClient({
    apiKey: 'sk-test'
  })

  expect(weather.functions.get('get_current_weather')).toBeTruthy()
})
