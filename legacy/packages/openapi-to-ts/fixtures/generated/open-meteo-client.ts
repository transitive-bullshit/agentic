/**
 * This file was auto-generated from an OpenAPI spec.
 */

import {
  AIFunctionsProvider,
  aiFunction,
  pick,
  sanitizeSearchParams
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { openmeteo } from './open-meteo'

/**
 * Agentic OpenMeteo client.
 *
 * Open-Meteo offers free weather forecast APIs for open-source developers and non-commercial use. No API key is required.
 */
export class OpenMeteoClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance

  protected readonly apiBaseUrl: string

  constructor({
    apiBaseUrl,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    super()

    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl
    })
  }

  /**
   * 7 day weather variables in hourly and daily resolution for given WGS84 latitude and longitude coordinates. Available worldwide.
   */
  @aiFunction({
    name: 'open_meteo_get_v1_forecast',
    description: `7 day weather variables in hourly and daily resolution for given WGS84 latitude and longitude coordinates. Available worldwide.`,
    inputSchema: openmeteo.GetV1ForecastParamsSchema,
    tags: ['Weather Forecast APIs']
  })
  async getV1Forecast(
    params: openmeteo.GetV1ForecastParams
  ): Promise<openmeteo.GetV1ForecastResponse> {
    return this.ky
      .get('/v1/forecast', {
        searchParams: sanitizeSearchParams(
          pick(
            params,
            'hourly',
            'daily',
            'latitude',
            'longitude',
            'current_weather',
            'temperature_unit',
            'wind_speed_unit',
            'timeformat',
            'timezone',
            'past_days'
          )
        )
      })
      .json<openmeteo.GetV1ForecastResponse>()
  }
}
