import {
  aiFunction,
  AIFunctionsProvider,
  getEnv,
  omit,
  pick,
  sanitizeSearchParams
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'

import { openmeteo } from './open-meteo'

/**
 * Agentic OpenMeteo weather client.
 *
 * Open-Meteo offers free weather forecast APIs for open-source developers
 * and non-commercial use.
 *
 * @note The API key is optional.
 *
 * @see https://open-meteo.com/en/docs
 */
export class OpenMeteoClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string | undefined
  protected readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('OPEN_METEO_API_KEY'),
    apiBaseUrl = openmeteo.apiBaseUrl,
    timeoutMs = 60_000,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    timeoutMs?: number
    ky?: KyInstance
  } = {}) {
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl,
      timeout: timeoutMs,
      ...(apiKey
        ? {
            headers: {
              Authorization: `Bearer ${apiKey}`
            }
          }
        : {})
    })
  }

  /**
   * Gets the 7-day weather variables in hourly and daily resolution for given
   * WGS84 latitude and longitude coordinates. Available worldwide.
   */
  @aiFunction({
    name: 'open_meteo_get_forecast',
    description: `Gets the 7-day weather forecast in hourly and daily resolution for given location. Available worldwide.`,
    inputSchema: openmeteo.GetV1ForecastParamsSchema
  })
  async getForecast(
    params: openmeteo.GetV1ForecastParams
  ): Promise<openmeteo.GetV1ForecastResponse> {
    const extractLocation = async (): Promise<openmeteo.Location> => {
      if ('name' in params.location) {
        const response = await this._geocode(params.location)
        return pick(response, 'latitude', 'longitude')
      }

      return params.location
    }

    const { start, end } = validateAndSetDates(params.startDate, params.endDate)

    const response = await this.ky
      .get('forecast', {
        searchParams: sanitizeSearchParams({
          ...(await extractLocation()),
          temperature_unit: params.temperatureUnit,
          start_date: toDateString(start),
          end_date: toDateString(end),
          current: [
            'temperature_2m',
            'rain',
            'relative_humidity_2m',
            'wind_speed_10m'
          ],
          daily: ['temperature_2m_max', 'temperature_2m_min', 'rain_sum'],
          hourly: ['temperature_2m', 'relative_humidity_2m', 'rain'],
          timezone: 'UTC'
        })
      })
      .json<openmeteo.GetV1ForecastResponse>()

    return omit(
      response,
      'latitude',
      'longitude',
      'elevation',
      'generationtime_ms',
      'utc_offset_seconds',
      'timezone',
      'timezone_abbreviation',
      'elevation',
      'hourly',
      'hourly_units'
    )
  }

  protected async _geocode(
    location: openmeteo.LocationSearch
  ): Promise<openmeteo.Location> {
    const { results } = await this.ky
      .get('search', {
        searchParams: sanitizeSearchParams({
          name: location.name,
          language: location.language,
          country: location.country,
          format: 'json',
          count: 1
        })
      })
      .json<any>()

    if (!results?.length) {
      throw new Error(`No results found for location "${location.name}"`)
    }

    return results[0]
  }
}

function toDateString(date: Date): string {
  return date.toISOString().split('T')[0]!
}

function validateAndSetDates(
  startDateStr: string,
  endDateStr?: string
): { start: Date; end: Date } {
  const now = new Date()
  const start = startDateStr
    ? new Date(startDateStr)
    : new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))

  if (endDateStr) {
    const end = new Date(endDateStr)
    if (end < start) {
      throw new Error(
        `The 'end_date' (${endDateStr}) has to occur on or after the 'start_date' (${startDateStr}).`
      )
    }
    return { start, end }
  } else {
    // If endDate is undefined, set it to the start date
    return { start, end: new Date(start) }
  }
}
