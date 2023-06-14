import { z } from 'zod'

import * as types from '@/types'
import { WeatherClient } from '@/services/weather'
import { BaseTask } from '@/task'

export const WeatherInputSchema = z.object({
  query: z
    .string()
    .describe(
      'Location to get the weather for. Can be a city name like "Paris", a zipcode like "53121", an international postal code like "SW1", or a latitude and longitude like "48.8567,2.3508"'
    )
})
export type WeatherInput = z.infer<typeof WeatherInputSchema>

const LocationSchema = z.object({
  name: z.string(),
  region: z.string(),
  country: z.string(),
  lat: z.number(),
  lon: z.number(),
  tz_id: z.string(),
  localtime_epoch: z.number(),
  localtime: z.string()
})

const ConditionSchema = z.object({
  text: z.string(),
  icon: z.string(),
  code: z.number()
})

const CurrentSchema = z.object({
  last_updated_epoch: z.number(),
  last_updated: z.string(),
  temp_c: z.number(),
  temp_f: z.number(),
  is_day: z.number(),
  condition: ConditionSchema,
  wind_mph: z.number(),
  wind_kph: z.number(),
  wind_degree: z.number(),
  wind_dir: z.string(),
  pressure_mb: z.number(),
  pressure_in: z.number(),
  precip_mm: z.number(),
  precip_in: z.number(),
  humidity: z.number(),
  cloud: z.number(),
  feelslike_c: z.number(),
  feelslike_f: z.number(),
  vis_km: z.number(),
  vis_miles: z.number(),
  uv: z.number(),
  gust_mph: z.number(),
  gust_kph: z.number()
})

export const WeatherOutputSchema = z.object({
  location: LocationSchema,
  current: CurrentSchema
})
export type WeatherOutput = z.infer<typeof WeatherOutputSchema>

export class WeatherTool extends BaseTask<WeatherInput, WeatherOutput> {
  client: WeatherClient

  constructor(
    opts: {
      weather: WeatherClient
    } & types.BaseTaskOptions
  ) {
    super(opts)

    this.client = opts.weather
  }

  public override get inputSchema() {
    return WeatherInputSchema
  }

  public override get outputSchema() {
    return WeatherOutputSchema
  }

  public override get nameForModel(): string {
    return 'getCurrentWeather'
  }

  public override get nameForHuman(): string {
    return 'Weather'
  }

  public override get descForModel(): string {
    return 'Useful for getting the current weather at a location'
  }

  protected override async _call(
    ctx: types.TaskCallContext<WeatherInput>
  ): Promise<WeatherOutput> {
    return this.client.getCurrentWeather(ctx.input!.query)
  }
}
