import { z } from 'zod'

import * as types from '@/types'
import { DiffbotClient } from '@/services/diffbot'
import { BaseTask } from '@/task'
import { omit, pick } from '@/utils'

export const DiffbotInputSchema = z.object({
  url: z.string().describe('URL of page to scrape')
})
export type DiffbotInput = z.infer<typeof DiffbotInputSchema>

export const DiffbotImageSchema = z.object({
  url: z.string().optional(),
  naturalWidth: z.number().optional(),
  naturalHeight: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  isCached: z.boolean().optional(),
  primary: z.boolean().optional()
})

export const DiffbotListItemSchema = z.object({
  title: z.string().optional(),
  link: z.string().optional(),
  summary: z.string().optional(),
  image: z.string().optional()
})

export const DiffbotObjectSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  siteName: z.string().optional(),
  author: z.string().optional(),
  authorUrl: z.string().optional(),
  pageUrl: z.string().optional(),
  date: z.string().optional(),
  estimatedDate: z.string().optional(),
  humanLanguage: z.string().optional(),
  text: z.string().describe('core text content of the page').optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(DiffbotImageSchema).optional(),
  items: z.array(DiffbotListItemSchema).optional()
})

export const DiffbotOutputSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  objects: z.array(DiffbotObjectSchema).optional()
})
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

    this._logger.info(res, `Diffbot response for url "${ctx.input!.url}"`)

    const pickedRes = {
      type: res.type,
      title: res.title,
      objects: res.objects.map((obj) => ({
        ...pick(
          obj,
          'type',
          'siteName',
          'author',
          'authorUrl',
          'pageUrl',
          'date',
          'estimatedDate',
          'humanLanguage',
          'items',
          'text'
        ),
        tags: obj.tags?.map((tag) => tag.label),
        images: obj.images?.map((image) => omit(image, 'diffbotUri'))
      }))
    }

    this._logger.info(
      pickedRes,
      `Diffbot picked response for url "${ctx.input!.url}"`
    )
    return this.outputSchema.parse(pickedRes)
  }
}
