import { z } from 'zod'

import * as types from '@/types'
import { NovuClient } from '@/services/novu'
import { BaseTask } from '@/task'

export const NovuNotificationToolInputSchema = z.object({
  name: z.string(),
  payload: z.record(z.any()),
  to: z.array(
    z.object({
      subscriberId: z.string(),
      email: z.string().optional(),
      firstName: z.string().optional(),
      lastName: z.string().optional(),
      phone: z.string().optional()
    })
  )
})

export type NovuNotificationToolInput = z.infer<
  typeof NovuNotificationToolInputSchema
>

export const NovuNotificationToolOutputSchema = z.object({
  data: z.object({
    acknowledged: z.boolean().optional(),
    status: z.string().optional(),
    transactionId: z.string().optional()
  })
})

export type NovuNotificationToolOutput = z.infer<
  typeof NovuNotificationToolOutputSchema
>

export class NovuNotificationTool extends BaseTask<
  NovuNotificationToolInput,
  NovuNotificationToolOutput
> {
  protected _novuClient: NovuClient

  constructor({
    novuClient = new NovuClient(),
    ...opts
  }: {
    novuClient?: NovuClient
  } & types.BaseTaskOptions = {}) {
    super(opts)

    this._novuClient = novuClient
  }

  public override get inputSchema() {
    return NovuNotificationToolInputSchema
  }

  public override get outputSchema() {
    return NovuNotificationToolOutputSchema
  }

  public override get nameForModel(): string {
    return 'novuSendNotification'
  }

  protected override async _call(
    ctx: types.TaskCallContext<NovuNotificationToolInput>
  ): Promise<NovuNotificationToolOutput> {
    return this._novuClient.triggerEvent(ctx.input!)
  }
}
