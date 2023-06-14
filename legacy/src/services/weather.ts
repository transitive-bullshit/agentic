import defaultKy from 'ky'

export const WEATHER_API_BASE_URL = 'https://api.weatherapi.com/v1'

interface CurrentWeatherResponse {
  current: CurrentWeather
  location: WeatherLocation
}

interface CurrentWeather {
  cloud: number
  condition: WeatherCondition
  feelslike_c: number
  feelslike_f: number
  gust_kph: number
  gust_mph: number
  humidity: number
  is_day: number
  last_updated: string
  last_updated_epoch: number
  precip_in: number
  precip_mm: number
  pressure_in: number
  pressure_mb: number
  temp_c: number
  temp_f: number
  uv: number
  vis_km: number
  vis_miles: number
  wind_degree: number
  wind_dir: string
  wind_kph: number
  wind_mph: number
}

interface WeatherCondition {
  code: number
  icon: string
  text: string
}

interface WeatherLocation {
  country: string
  lat: number
  localtime: string
  localtime_epoch: number
  lon: number
  name: string
  region: string
  tz_id: string
}

interface WeatherIPInfoResponse {
  ip: string
  type: string
  continent_code: string
  continent_name: string
  country_code: string
  country_name: string
  is_eu: string
  geoname_id: number
  city: string
  region: string
  lat: number
  lon: number
  tz_id: string
  localtime_epoch: number
  localtime: string
}

export class WeatherClient {
  api: typeof defaultKy

  apiKey: string
  apiBaseUrl: string

  constructor({
    apiKey = process.env.WEATHER_API_KEY,
    apiBaseUrl = WEATHER_API_BASE_URL,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: typeof defaultKy
  } = {}) {
    if (!apiKey) {
      throw new Error(`Error WeatherClient missing required "apiKey"`)
    }

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.api = ky.extend({ prefixUrl: apiBaseUrl })
  }

  async getCurrentWeather(queryOrOptions: string | { q: string }) {
    const options =
      typeof queryOrOptions === 'string'
        ? { q: queryOrOptions }
        : queryOrOptions

    return this.api
      .get('current.json', {
        searchParams: {
          key: this.apiKey,
          ...options
        }
      })
      .json<CurrentWeatherResponse>()
  }

  async ipInfo(ipOrOptions: string | { q: string }) {
    const options =
      typeof ipOrOptions === 'string' ? { q: ipOrOptions } : ipOrOptions

    return this.api
      .get('ip.json', {
        searchParams: {
          key: this.apiKey,
          ...options
        }
      })
      .json<WeatherIPInfoResponse>()
  }
}
