import { type Midjourney } from '@agentic/midjourney-fetch'
import pMap from 'p-map'
import { z } from 'zod'

import * as types from '@/types'
import { BaseTask } from '@/task'

export const MidjourneyInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'Simple, short, comma-separated list of phrases which describe the image you want to generate'
    ),
  numImages: z.number().default(1).optional()
})
export type MidjourneyInput = z.infer<typeof MidjourneyInputSchema>

export const MidjourneyImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  components: z.array(
    z
      .object({
        type: z.number(),
        components: z.array(
          z.object({
            type: z.number(),
            custom_id: z.string(),
            style: z.number(),
            label: z.string()
          })
        )
      })
      .deepPartial()
  )
})
export const MidjourneyOutputSchema = z.object({
  images: z.array(MidjourneyImageSchema)
})
export type MidjourneyOutput = z.infer<typeof MidjourneyOutputSchema>

export class MidjourneyImagineTool extends BaseTask<
  MidjourneyInput,
  MidjourneyOutput
> {
  protected _midjourneyClient: Midjourney

  constructor(
    opts: {
      midjourney: Midjourney
    } & types.BaseTaskOptions
  ) {
    super(opts)

    this._midjourneyClient = opts.midjourney
  }

  public override get inputSchema() {
    return MidjourneyInputSchema
  }

  public override get outputSchema() {
    return MidjourneyOutputSchema
  }

  public override get nameForModel(): string {
    return 'midjourneyImagine'
  }

  public override get descForModel(): string {
    return 'Creates one or more images from a prompt using the Midjourney API. Useful for generating images on the fly.'
  }

  protected override async _call(
    ctx: types.TaskCallContext<MidjourneyInput>
  ): Promise<MidjourneyOutput> {
    const numImages = ctx.input!.numImages || 1

    const images = (
      await pMap(
        new Array(numImages).fill(0),
        async () => {
          try {
            const message = await this._midjourneyClient.imagine(
              ctx.input!.prompt
            )

            if (!message) {
              throw new Error('Midjourney API failed to return a message')
            }

            const attachment = message.attachments?.[0]
            if (!attachment) {
              throw new Error('Midjourney API returned invalid message')
            }

            return {
              id: message.id,
              url: attachment.url,
              components: message.components
            }
          } catch (err) {
            this._logger.error(err, 'Midjourney API error')
            return null
          }
        },
        {
          concurrency: 1
        }
      )
    ).filter(Boolean)

    return this.outputSchema.parse({ images })
  }
}
