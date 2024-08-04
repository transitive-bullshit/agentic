import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  delay,
  getEnv,
  pruneNullOrUndefined,
  TimeoutError
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

// TODO: add additional methods for upscaling, variations, etc.

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

  export interface JobOptions {
    wait?: boolean
    timeoutMs?: number
    intervalMs?: number
  }
}

/**
 * Unofficial Midjourney API client for generative images.
 *
 * @see https://www.imagineapi.dev
 */
export class MidjourneyClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly apiKey: string
  protected readonly apiBaseUrl: string

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
    promptOrOptions:
      | string
      | ({
          prompt: string
        } & midjourney.JobOptions)
  ): Promise<midjourney.Job> {
    const {
      wait = true,
      timeoutMs,
      intervalMs,
      ...options
    } = typeof promptOrOptions === 'string'
      ? ({ prompt: promptOrOptions } as {
          prompt: string
        } & midjourney.JobOptions)
      : promptOrOptions

    const res = await this.ky
      .post('items/images', {
        json: { ...options }
      })
      .json<midjourney.ImagineResponse>()

    const job = pruneNullOrUndefined(res.data)
    if (!wait) {
      return job
    }

    if (job.status === 'completed' || job.status === 'failed') {
      return job
    }

    return this.waitForJobById(job.id, {
      timeoutMs,
      intervalMs
    })
  }

  async getJobById(
    jobIdOrOptions:
      | string
      | ({
          jobId: string
        } & midjourney.JobOptions)
  ): Promise<midjourney.Job> {
    const {
      jobId,
      wait = true,
      timeoutMs,
      intervalMs
    } = typeof jobIdOrOptions === 'string'
      ? ({ jobId: jobIdOrOptions } as {
          jobId: string
        } & midjourney.JobOptions)
      : jobIdOrOptions

    const res = await this.ky
      .get(`items/images/${jobId}`)
      .json<midjourney.ImagineResponse>()

    const job = pruneNullOrUndefined(res.data)
    if (!wait) {
      return job
    }

    if (job.status === 'completed' || job.status === 'failed') {
      return job
    }

    return this.waitForJobById(job.id, {
      timeoutMs,
      intervalMs
    })
  }

  async waitForJobById(
    jobId: string,
    {
      timeoutMs = 5 * 60 * 1000, // 5 minutes
      intervalMs = 1000
    }: Omit<midjourney.JobOptions, 'wait'> = {}
  ): Promise<midjourney.Job> {
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
