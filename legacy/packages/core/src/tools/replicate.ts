import pMap from 'p-map'
import Replicate from 'replicate'
import { z } from 'zod'

import * as types from '@/types'
import { getEnv } from '@/env'
import { BaseTask } from '@/task'

const REPLICATE_SD_MODEL =
  'stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf'

const ReplicateInputSchema = z.object({
  images: z.array(
    z.object({
      prompt: z
        .string()
        .describe(
          'Simple, short, comma-separated list of phrases which describes the image you want to generate'
        ),
      negativePrompt: z
        .string()
        .optional()
        .describe(
          'Simple, short, comma-separated list of phrases which describes qualities of the image you do NOT want to generate. Example: low quality, blurry, pixelated'
        )
      // seed: z.number().int().optional()
    })
  )
})
type ReplicateInput = z.infer<typeof ReplicateInputSchema>

const ReplicateOutputSchema = z.object({
  images: z.array(z.string())
})
type ReplicateOutput = z.infer<typeof ReplicateOutputSchema>

export class ReplicateStableDiffusionTool extends BaseTask<
  ReplicateInput,
  ReplicateOutput
> {
  protected _replicateClient: Replicate

  constructor(
    opts: {
      replicate?: Replicate
    } & types.BaseTaskOptions = {}
  ) {
    super(opts)

    this._replicateClient =
      opts.replicate ||
      new Replicate({
        auth: getEnv('REPLICATE_API_KEY')!
      })
  }

  public override get inputSchema() {
    return ReplicateInputSchema
  }

  public override get outputSchema() {
    return ReplicateOutputSchema
  }

  public override get nameForModel(): string {
    return 'replicateStableDiffusion'
  }

  public override get descForModel(): string {
    return 'Creates one or more images from a prompt using the Replicate stable diffusion API. Useful for generating images on the fly.'
  }

  protected override async _call(
    ctx: types.TaskCallContext<ReplicateInput>
  ): Promise<ReplicateOutput> {
    const images = (
      await pMap(
        ctx.input!.images,
        async (image) => {
          try {
            const input = {
              prompt: image.prompt
            }

            if (image.negativePrompt) {
              input['negative_prompt'] = image.negativePrompt
            }

            console.log('>>> replicate', image)
            const output: any = await this._replicateClient.run(
              REPLICATE_SD_MODEL,
              {
                input
              }
            )

            console.log('<<< replicate', image, output)
            return output
          } catch (err) {
            this._logger.error('Replicate API error', err)
            return []
          }
        },
        {
          concurrency: 5
        }
      )
    ).flat()

    // console.log('replicate output', images)
    return this.outputSchema.parse({ images })
  }
}
