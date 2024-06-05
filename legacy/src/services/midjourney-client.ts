import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

import { TimeoutError } from '../errors.js'
import { aiFunction, AIFunctionsProvider } from '../fns.js'
import { assert, delay, getEnv, pruneNullOrUndefined } from '../utils.js'

export namespace midjourney {
  export const API_BASE_URL = 'https://cl.imagineapi.dev'

  export type JobStatus = 'pending' | 'in-progress' | 'completed' | 'failed'

  export interface ImagineResponse {
    data: Job
  }

  export interface Job {
    id: string
    prompt: string
    status: JobStatus
    user_created: string
    date_created: string
    results?: string
    progress?: string
    url?: string
    error?: string
    upscaled_urls?: string[]
    ref?: string
    upscaled?: string[]
  }
}

/**
 * Unofficial Midjourney API client.
 *
 * @see https://www.imagineapi.dev
 */
export class MidjourneyClient extends AIFunctionsProvider {
  readonly ky: KyInstance
  readonly apiKey: string
  readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('MIDJOURNEY_IMAGINE_API_KEY'),
    apiBaseUrl = midjourney.API_BASE_URL,
    ky = defaultKy
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(
      apiKey,
      'MidjourneyClient missing required "apiKey" (defaults to "MIDJOURNEY_IMAGINE_API_KEY")'
    )
    super()

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`
      }
    })
  }

  @aiFunction({
    name: 'midjourney_create_images',
    description:
      'Creates 4 images from a prompt using the Midjourney API. Useful for generating images on the fly.',
    inputSchema: z.object({
      prompt: z
        .string()
        .describe(
          'Simple, short, comma-separated list of phrases which describe the image you want to generate'
        )
    })
  })
  async imagine(
    promptOrOptions: string | { prompt: string }
  ): Promise<midjourney.Job> {
    const options =
      typeof promptOrOptions === 'string'
        ? { prompt: promptOrOptions }
        : promptOrOptions

    const res = await this.ky
      .post('items/images', {
        json: { ...options }
      })
      .json<midjourney.ImagineResponse>()

    return pruneNullOrUndefined(res.data)
  }

  async getJobById(jobId: string): Promise<midjourney.Job> {
    const res = await this.ky
      .get(`items/images/${jobId}`)
      .json<midjourney.ImagineResponse>()

    return pruneNullOrUndefined(res.data)
  }

  async waitForJobById(
    jobId: string,
    {
      timeoutMs = 5 * 60 * 1000, // 5 minutes
      intervalMs = 1000
    }: {
      timeoutMs?: number
      intervalMs?: number
    } = {}
  ) {
    const startTimeMs = Date.now()

    function checkForTimeout() {
      const elapsedTimeMs = Date.now() - startTimeMs
      if (elapsedTimeMs >= timeoutMs) {
        throw new TimeoutError(
          `MidjourneyClient timeout waiting for job "${jobId}"`
        )
      }
    }

    do {
      checkForTimeout()

      const job = await this.getJobById(jobId)
      if (job.status === 'completed' || job.status === 'failed') {
        return job
      }

      checkForTimeout()
      await delay(intervalMs)
    } while (true)
  }
}
