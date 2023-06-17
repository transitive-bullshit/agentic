import { z } from 'zod'

import * as types from '@/types'
import { DiffbotClient } from '@/services/diffbot'
import { BaseTask } from '@/task'
import { pick } from '@/utils'

export const DiffbotInputSchema = z.object({
  url: z.string().describe('URL of page to scrape')
})
export type DiffbotInput = z.infer<typeof DiffbotInputSchema>

export const DiffbotImageSchema = z.object({
  url: z.string(),
  naturalWidth: z.number(),
  naturalHeight: z.number(),
  width: z.number(),
  height: z.number(),
  isCached: z.boolean(),
  primary: z.boolean()
})

export const DiffbotListItemSchema = z.object({
  title: z.string(),
  link: z.string(),
  summary: z.string(),
  image: z.string()
})

export const DiffbotObjectTypeSchema = z.union([
  z.literal('article'),
  z.literal('product'),
  z.literal('discussion'),
  z.literal('image'),
  z.literal('video'),
  z.literal('list'),
  z.literal('event'),
  z.string()
])

export const DiffbotObjectSchema = z.object({
  type: DiffbotObjectTypeSchema,
  title: z.string(),
  siteName: z.string(),
  author: z.string(),
  // authorUrl: z.string(),
  pageUrl: z.string(),
  date: z.string(),
  // estimatedDate: z.string(),
  // humanLanguage: z.string(),
  text: z.string().describe('main text content of the page'),
  // tags: z.array(z.string()),
  // images: z.array(DiffbotImageSchema),
  items: z.array(DiffbotListItemSchema)
})

export const DiffbotOutputSchema = z
  .object({
    type: DiffbotObjectTypeSchema,
    title: z.string(),
    objects: z.array(DiffbotObjectSchema)
  })
  .deepPartial()
export type DiffbotOutput = z.infer<typeof DiffbotOutputSchema>

export class DiffbotTool extends BaseTask<DiffbotInput, DiffbotOutput> {
  protected _diffbotClient: DiffbotClient

  constructor(
    opts: {
      diffbot?: DiffbotClient
    } & types.BaseTaskOptions = {}
  ) {
    super(opts)

    this._diffbotClient =
      opts.diffbot ?? new DiffbotClient({ ky: opts.agentic?.ky })
  }

  public override get inputSchema() {
    return DiffbotInputSchema
  }

  public override get outputSchema() {
    return DiffbotOutputSchema
  }

  public override get nameForModel(): string {
    return 'scrapeWebPage'
  }

  public override get nameForHuman(): string {
    return 'Diffbot Scrape Web Page'
  }

  public override get descForModel(): string {
    return 'Scrapes a web page for its content and structured data.'
  }

  protected override async _call(
    ctx: types.TaskCallContext<DiffbotInput>
  ): Promise<DiffbotOutput> {
    const res = await this._diffbotClient.extractAnalyze({
      url: ctx.input!.url
    })

    // this._logger.info(res, `Diffbot response for url "${ctx.input!.url}"`)

    const output = this.outputSchema.parse({
      type: res.type,
      title: res.title,
      objects: res.objects?.map(
        (obj) =>
          ({
            ...pick(
              obj,
              'type',
              'siteName',
              'author',
              // 'authorUrl',
              'pageUrl',
              'date',
              // 'estimatedDate',
              // 'humanLanguage',
              'items',
              'text'
            )
            // tags: obj.tags?.map((tag) => tag.label)
            // images: obj.images?.map((image) => omit(image, 'diffbotUri'))
          } || [])
      )
    })

    this._logger.info(output, `Diffbot response for url "${ctx.input!.url}"`)
    return output
  }
}
