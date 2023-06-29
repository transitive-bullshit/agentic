import defaultKy from 'ky'

import { getEnv } from '@/env'
import { isArray, isString } from '@/utils'

export const STABILITY_API_BASE_URL = 'https://api.stability.ai'
export const STABILITY_DEFAULT_IMAGE_GENERATION_ENGINE_ID =
  'stable-diffusion-512-v2-1'
export const STABILITY_DEFAULT_IMAGE_UPSCALE_ENGINE_ID = 'esrgan-v1-x2plus'
export const STABILITY_DEFAULT_IMAGE_MASKING_ENGINE_ID =
  'stable-inpainting-512-v2-0'

export interface StabilityTextToImageOptions {
  textPrompts: StabilityTextToImagePrompt[]

  engineId?: string
  width?: number
  height?: number
  cfgScale?: number
  clipGuidancePreset?: string
  sampler?: StabilityTextToImageSampler
  samples?: number
  seed?: number
  steps?: number
  stylePreset?: StabilityImageStylePreset
}

export interface StabilityImageToImageOptions {
  // if initImage is a string, it should be encoed as `binary`
  initImage: string | Buffer | Blob
  textPrompts: StabilityTextToImagePrompt[]

  initImageMode?: 'IMAGE_STRENGTH' | 'STEP_SCHEDULE'
  imageStrength?: number

  engineId?: string
  cfgScale?: number
  clipGuidancePreset?: string
  sampler?: StabilityTextToImageSampler
  samples?: number
  seed?: number
  steps?: number
  stylePreset?: StabilityImageStylePreset
}

export interface StabilityImageToImageMaskingOptions
  extends StabilityImageToImageOptions {
  maskImage: string | Buffer | Blob
  maskSource?: 'MASK_IMAGE_WHITE' | 'MASK_IMAGE_BLACK' | 'INIT_IMAGE_ALPHA'
}

export interface StabilityImageUpscaleOptions {
  image: string | Buffer | Blob

  // only available on certain engines
  textPrompts?: StabilityTextToImagePrompt[]

  // should specify either width or height
  width?: number
  height?: number

  engineId?: string

  // only available on certain engines
  cfgScale?: number
  seed?: number
  steps?: number
}

export type StabilityTextToImagePrompt = {
  text: string
  weight?: number
}

export type StabilityImageStylePreset =
  | 'enhance'
  | 'anime'
  | 'photographic'
  | 'digital-art'
  | 'comic-book'
  | 'fantasy-art'
  | 'line-art'
  | 'analog-film'
  | 'neon-punk'
  | 'isometric'
  | 'low-poly'
  | 'origami'
  | 'modeling-compound'
  | 'cinematic'
  | '3d-model'
  | 'pixel-art'
  | 'tile-texture'

export type StabilityTextToImageSampler =
  | 'DDIM'
  | 'DDPM'
  | 'K_DPMPP_2M'
  | 'K_DPMPP_2S_ANCESTRAL'
  | 'K_DPM_2'
  | 'K_DPM_2_ANCESTRAL'
  | 'K_EULER'
  | 'K_EULER_ANCESTRAL'
  | 'K_HEUN'
  | 'K_LMS'

export interface StabilityEngine {
  description: string
  id: string
  name: string
  type: string
}
export type StabilityListEnginesResponse = StabilityEngine[]

export interface StabilityTextToImageResponse {
  artifacts: Array<{
    base64: string
    finishReason: 'CONTENT_FILTERED' | 'ERROR' | 'SUCCESS'
    seed: number
  }>
}

export type StabilityImageToImageResponse = StabilityTextToImageResponse

export interface StabilityUserAccountResponse {
  email: string
  id: string
  profile_picture?: string
  organizations: Array<{
    id: string
    is_default: boolean
    name: string
    role: string
  }>
}

export interface StabilityUserBalanceResponse {
  credits: number
}

export class StabilityClient {
  public readonly api: typeof defaultKy
  public readonly apiKey: string
  public readonly apiBaseUrl: string

  constructor({
    apiKey = getEnv('STABILITY_API_KEY'),
    apiBaseUrl = STABILITY_API_BASE_URL,
    ky = defaultKy,
    organizationId = getEnv('STABILITY_ORGANIZATION_ID'),
    clientId = '@agentic/stability',
    clientVersion
  }: {
    apiKey?: string
    apiBaseUrl?: string
    ky?: typeof defaultKy
    organizationId?: string
    clientId?: string
    clientVersion?: string
  } = {}) {
    if (!apiKey) {
      throw new Error(`Error StabilityClient missing required "apiKey"`)
    }

    this.apiKey = apiKey
    this.apiBaseUrl = apiBaseUrl

    this.api = ky.extend({
      prefixUrl: apiBaseUrl,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        Organization: organizationId,
        'Stability-Client-ID': clientId,
        'Stability-Client-Version': clientVersion
      }
    })
  }

  /**
   * Generates a new image from a text prompt. Can also generate multiple images
   * from an array of text prompts.
   *
   * @see https://platform.stability.ai/rest-api#tag/v1generation/operation/textToImage
   */
  async textToImage(
    promptOrTextToImageOptions: string | string[] | StabilityTextToImageOptions
  ) {
    const defaultOptions: Partial<StabilityTextToImageOptions> = {
      engineId: STABILITY_DEFAULT_IMAGE_GENERATION_ENGINE_ID
    }

    const options: StabilityTextToImageOptions = isString(
      promptOrTextToImageOptions
    )
      ? {
          ...defaultOptions,
          textPrompts: [
            {
              text: promptOrTextToImageOptions
            }
          ]
        }
      : isArray(promptOrTextToImageOptions)
      ? {
          ...defaultOptions,
          textPrompts: promptOrTextToImageOptions.map((text) => ({ text }))
        }
      : {
          ...defaultOptions,
          ...promptOrTextToImageOptions
        }

    return this.api
      .post(`v1/generation/${options.engineId}/text-to-image`, {
        json: {
          text_prompts: options.textPrompts,
          width: options.width,
          height: options.height,
          cfg_scale: options.cfgScale,
          clip_guidance_preset: options.clipGuidancePreset,
          sampler: options.sampler,
          samples: options.samples,
          seed: options.seed,
          steps: options.steps,
          style_preset: options.stylePreset
        }
      })
      .json<StabilityTextToImageResponse>()
  }

  /**
   * Modifies an initial image based on a text prompt.
   *
   * @see https://platform.stability.ai/rest-api#tag/v1generation/operation/imageToImage
   */
  async imageToImage(opts: StabilityImageToImageOptions) {
    const { engineId = STABILITY_DEFAULT_IMAGE_GENERATION_ENGINE_ID } = opts

    const body = createFormData(
      opts,
      {
        textPrompts: 'text_prompts',
        initImageMode: 'init_image_mode',
        cfgScale: 'cfg_scale',
        clipGuidancePreset: 'clip_guidance_preset',
        sampler: 'sampler',
        samples: 'samples',
        seed: 'seed',
        steps: 'steps',
        stylePreset: 'style_preset'
      },
      {
        initImage: 'init_image'
      }
    )

    return this.api
      .post(`v1/generation/${engineId}/image-to-image`, {
        body
      })
      .json<StabilityImageToImageResponse>()
  }

  /**
   * Creates a higher resolution version of an input image.
   *
   * @see https://platform.stability.ai/rest-api#tag/v1generation/operation/upscaleImage
   */
  async upscaleImage(opts: StabilityImageUpscaleOptions) {
    const { engineId = STABILITY_DEFAULT_IMAGE_UPSCALE_ENGINE_ID } = opts

    const body = createFormData(
      opts,
      {
        textPrompts: 'text_prompts',
        cfgScale: 'cfg_scale',
        width: 'width',
        height: 'height',
        seed: 'seed',
        steps: 'steps'
      },
      {
        image: 'image'
      }
    )

    return this.api
      .post(`v1/generation/${engineId}/image-to-image/upscale`, {
        body
      })
      .json<StabilityImageToImageResponse>()
  }

  /**
   * Selectively modifies portions of an initial image using a mask image.
   *
   * @see https://platform.stability.ai/rest-api#tag/v1generation/operation/masking
   */
  async maskImage(opts: StabilityImageToImageMaskingOptions) {
    const { engineId = STABILITY_DEFAULT_IMAGE_MASKING_ENGINE_ID } = opts

    const body = createFormData(
      { ...opts, maskSource: 'MASK_IMAGE_BLACK' },
      {
        textPrompts: 'text_prompts',
        initImageMode: 'init_image_mode',
        maskSource: 'mask_source',
        cfgScale: 'cfg_scale',
        clipGuidancePreset: 'clip_guidance_preset',
        sampler: 'sampler',
        samples: 'samples',
        seed: 'seed',
        steps: 'steps',
        stylePreset: 'style_preset'
      },
      {
        initImage: 'init_image',
        maskImage: 'mask_image'
      }
    )

    return this.api
      .post(`v1/generation/${engineId}/image-to-image/masking`, {
        body
      })
      .json<StabilityImageToImageResponse>()
  }

  /**
   * Lists the available engines (e.g., models).
   *
   * @see https://platform.stability.ai/rest-api#tag/v1engines
   */
  async listEngines() {
    return this.api.get('v1/engines/list').json<StabilityListEnginesResponse>()
  }

  /**
   * Gets information about the user associated with this account.
   *
   * @see https://platform.stability.ai/rest-api#tag/v1user/operation/userAccount
   */
  async getUserAccount() {
    return this.api.get('v1/user/account').json<StabilityUserAccountResponse>()
  }

  /**
   * Gets the credit balance of the account/organization associated with this account.
   *
   * @see https://platform.stability.ai/rest-api#tag/v1user/operation/userBalance
   */
  async getUserBalance() {
    return this.api.get('v1/user/balance').json<StabilityUserBalanceResponse>()
  }
}

function createFormData(
  data: Record<string, any>,
  jsonKeys: Record<string, string>,
  imageKeys?: Record<string, string>
) {
  const formData = new FormData()

  for (const [key, key2] of Object.entries(imageKeys || {})) {
    const value = data[key]
    if (value !== undefined) {
      formData.append(
        key2,
        Buffer.isBuffer(value) ? value.toString('binary') : value
      )
    }
  }

  for (const [key, key2] of Object.entries(jsonKeys)) {
    const value = data[key]
    if (value !== undefined) {
      formData.append(key2, JSON.stringify(value))
    }
  }

  return formData
}
