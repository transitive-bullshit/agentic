import * as metaphor from '@/services/metaphor'
import * as types from '@/types'
import { BaseTask } from '@/task'

export class MetaphorSearchTool extends BaseTask<
  metaphor.MetaphorSearchInput,
  metaphor.MetaphorSearchOutput
> {
  protected _metaphorClient: metaphor.MetaphorClient

  constructor({
    metaphorClient = new metaphor.MetaphorClient(),
    ...opts
  }: {
    metaphorClient?: metaphor.MetaphorClient
  } & types.BaseTaskOptions = {}) {
    super(opts)

    this._metaphorClient = metaphorClient
  }

  public override get inputSchema() {
    return metaphor.MetaphorSearchInputSchema
  }

  public override get outputSchema() {
    return metaphor.MetaphorSearchOutputSchema
  }

  public override get nameForModel(): string {
    return 'metaphorWebSearch'
  }

  protected override async _call(
    ctx: types.TaskCallContext<metaphor.MetaphorSearchInput>
  ): Promise<metaphor.MetaphorSearchOutput> {
    // TODO: test required inputs
    return this._metaphorClient.search(ctx.input!)
  }
}
