import * as metaphor from '@/services/metaphor'
import * as types from '@/types'
import { Agentic } from '@/agentic'
import { BaseTask } from '@/task'

export class MetaphorSearchTool extends BaseTask<
  metaphor.MetaphorSearchInput,
  metaphor.MetaphorSearchOutput
> {
  _metaphorClient: metaphor.MetaphorClient

  constructor({
    agentic,
    metaphorClient = new metaphor.MetaphorClient(),
    ...rest
  }: {
    agentic: Agentic
    metaphorClient?: metaphor.MetaphorClient
  } & types.BaseTaskOptions) {
    super({
      agentic,
      ...rest
    })

    this._metaphorClient = metaphorClient
  }

  public override get inputSchema() {
    return metaphor.MetaphorSearchInputSchema
  }

  public override get outputSchema() {
    return metaphor.MetaphorSearchOutputSchema
  }

  public override get nameForModel(): string {
    return 'metaphor_web_search'
  }

  protected override async _call(
    ctx: types.TaskCallContext<metaphor.MetaphorSearchInput>
  ): Promise<metaphor.MetaphorSearchOutput> {
    // TODO: test required inputs
    return this._metaphorClient.search(ctx.input!)
  }
}
