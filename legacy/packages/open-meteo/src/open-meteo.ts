import { z } from 'zod'

export namespace openmeteo {
  export const apiBaseUrl = 'https://api.open-meteo.com/v1'

  // -----------------------------------------------------------------------------
  // Component schemas
  // -----------------------------------------------------------------------------

  /** For each selected weather variable, data will be returned as a floating point array. Additionally a `time` array will be returned with ISO8601 timestamps. */
  export const HourlyResponseSchema = z
    .object({
      time: z.array(z.string()),
      temperature_2m: z.array(z.number()).optional(),
      relative_humidity_2m: z.array(z.number()).optional(),
      dew_point_2m: z.array(z.number()).optional(),
      apparent_temperature: z.array(z.number()).optional(),
      pressure_msl: z.array(z.number()).optional(),
      cloud_cover: z.array(z.number()).optional(),
      cloud_cover_low: z.array(z.number()).optional(),
      cloud_cover_mid: z.array(z.number()).optional(),
      cloud_cover_high: z.array(z.number()).optional(),
      wind_speed_10m: z.array(z.number()).optional(),
      wind_speed_80m: z.array(z.number()).optional(),
      wind_speed_120m: z.array(z.number()).optional(),
      wind_speed_180m: z.array(z.number()).optional(),
      wind_direction_10m: z.array(z.number()).optional(),
      wind_direction_80m: z.array(z.number()).optional(),
      wind_direction_120m: z.array(z.number()).optional(),
      wind_direction_180m: z.array(z.number()).optional(),
      wind_gusts_10m: z.array(z.number()).optional(),
      shortwave_radiation: z.array(z.number()).optional(),
      direct_radiation: z.array(z.number()).optional(),
      direct_normal_irradiance: z.array(z.number()).optional(),
      diffuse_radiation: z.array(z.number()).optional(),
      vapour_pressure_deficit: z.array(z.number()).optional(),
      evapotranspiration: z.array(z.number()).optional(),
      precipitation: z.array(z.number()).optional(),
      weather_code: z.array(z.number()).optional(),
      snow_height: z.array(z.number()).optional(),
      freezing_level_height: z.array(z.number()).optional(),
      soil_temperature_0cm: z.array(z.number()).optional(),
      soil_temperature_6cm: z.array(z.number()).optional(),
      soil_temperature_18cm: z.array(z.number()).optional(),
      soil_temperature_54cm: z.array(z.number()).optional(),
      soil_moisture_0_1cm: z.array(z.number()).optional(),
      soil_moisture_1_3cm: z.array(z.number()).optional(),
      soil_moisture_3_9cm: z.array(z.number()).optional(),
      soil_moisture_9_27cm: z.array(z.number()).optional(),
      soil_moisture_27_81cm: z.array(z.number()).optional()
    })
    .describe(
      'For each selected weather variable, data will be returned as a floating point array. Additionally a `time` array will be returned with ISO8601 timestamps.'
    )
  export type HourlyResponse = z.infer<typeof HourlyResponseSchema>

  /** For each selected daily weather variable, data will be returned as a floating point array. Additionally a `time` array will be returned with ISO8601 timestamps. */
  export const DailyResponseSchema = z
    .object({
      time: z.array(z.string()),
      temperature_2m_max: z.array(z.number()).optional(),
      temperature_2m_min: z.array(z.number()).optional(),
      apparent_temperature_max: z.array(z.number()).optional(),
      apparent_temperature_min: z.array(z.number()).optional(),
      precipitation_sum: z.array(z.number()).optional(),
      precipitation_hours: z.array(z.number()).optional(),
      weather_code: z.array(z.number()).optional(),
      sunrise: z.array(z.number()).optional(),
      sunset: z.array(z.number()).optional(),
      wind_speed_10m_max: z.array(z.number()).optional(),
      wind_gusts_10m_max: z.array(z.number()).optional(),
      wind_direction_10m_dominant: z.array(z.number()).optional(),
      shortwave_radiation_sum: z.array(z.number()).optional(),
      uv_index_max: z.array(z.number()).optional(),
      uv_index_clear_sky_max: z.array(z.number()).optional(),
      et0_fao_evapotranspiration: z.array(z.number()).optional()
    })
    .describe(
      'For each selected daily weather variable, data will be returned as a floating point array. Additionally a `time` array will be returned with ISO8601 timestamps.'
    )
  export type DailyResponse = z.infer<typeof DailyResponseSchema>

  /** Current weather conditions with the attributes: time, temperature, wind_speed, wind_direction and weather_code */
  export const CurrentWeatherSchema = z
    .object({
      time: z.string(),
      temperature: z.number(),
      wind_speed: z.number(),
      wind_direction: z.number(),
      weather_code: z.number().int()
    })
    .describe(
      'Current weather conditions with the attributes: time, temperature, wind_speed, wind_direction and weather_code'
    )
  export type CurrentWeather = z.infer<typeof CurrentWeatherSchema>

  // -----------------------------------------------------------------------------
  // Operation schemas
  // -----------------------------------------------------------------------------

  export const GetV1ForecastParamsSchema = z.object({
    location: z.union([
      z
        .object({
          name: z.string().min(1),
          country: z.string().optional(),
          language: z.string().default('English')
        })
        .strip(),
      z
        .object({
          latitude: z.coerce.number(),
          longitude: z.coerce.number()
        })
        .strip()
    ]),
    startDate: z
      .string()
      .date()
      .describe(
        'Start date for the weather forecast in the format YYYY-MM-DD (UTC)'
      ),
    endDate: z
      .string()
      .date()
      .describe(
        'End date for the weather forecast in the format YYYY-MM-DD (UTC)'
      )
      .optional(),
    temperatureUnit: z.enum(['celsius', 'fahrenheit']).default('fahrenheit')
  })
  export type GetV1ForecastParams = z.infer<typeof GetV1ForecastParamsSchema>

  export const GetV1ForecastResponseSchema = z.object({
    /** WGS84 of the center of the weather grid-cell which was used to generate this forecast. This coordinate might be up to 5 km away. */
    latitude: z
      .number()
      .describe(
        'WGS84 of the center of the weather grid-cell which was used to generate this forecast. This coordinate might be up to 5 km away.'
      )
      .optional(),
    /** WGS84 of the center of the weather grid-cell which was used to generate this forecast. This coordinate might be up to 5 km away. */
    longitude: z
      .number()
      .describe(
        'WGS84 of the center of the weather grid-cell which was used to generate this forecast. This coordinate might be up to 5 km away.'
      )
      .optional(),
    /** The elevation in meters of the selected weather grid-cell. In mountain terrain it might differ from the location you would expect. */
    elevation: z
      .number()
      .describe(
        'The elevation in meters of the selected weather grid-cell. In mountain terrain it might differ from the location you would expect.'
      )
      .optional(),
    /** Generation time of the weather forecast in milli seconds. This is mainly used for performance monitoring and improvements. */
    generationtime_ms: z
      .number()
      .describe(
        'Generation time of the weather forecast in milli seconds. This is mainly used for performance monitoring and improvements.'
      )
      .optional(),
    /** Applied timezone offset from the &timezone= parameter. */
    utc_offset_seconds: z
      .number()
      .int()
      .describe('Applied timezone offset from the &timezone= parameter.')
      .optional(),
    hourly: HourlyResponseSchema.optional(),
    /** For each selected weather variable, the unit will be listed here. */
    hourly_units: z
      .record(z.string())
      .describe(
        'For each selected weather variable, the unit will be listed here.'
      )
      .optional(),
    daily: DailyResponseSchema.optional(),
    /** For each selected daily weather variable, the unit will be listed here. */
    daily_units: z
      .record(z.string())
      .describe(
        'For each selected daily weather variable, the unit will be listed here.'
      )
      .optional(),
    current_weather: CurrentWeatherSchema.optional()
  })
  export type GetV1ForecastResponse = z.infer<
    typeof GetV1ForecastResponseSchema
  >

  export interface Location {
    latitude: number
    longitude: number
  }

  export interface LocationSearch {
    name: string
    country?: string
    language?: string
  }
}
