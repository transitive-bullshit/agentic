import { Agentic } from '@/agentic'
import { BaseTask } from '@/task'
import { TaskResponseMetadata } from '@/types'

import { HumanFeedbackMechanismCLI } from './cli'

/**
 * Available types of human feedback.
 */
export type HumanFeedbackType = 'confirm' | 'selectOne' | 'selectN'

type HumanFeedbackMechanismConstructor<T extends HumanFeedbackMechanism> = new (
  ...args: any[]
) => T

/**
 * Options for human feedback.
 */
export type HumanFeedbackOptions<
  T extends HumanFeedbackMechanism = HumanFeedbackMechanism
> = {
  /**
   * What type of feedback to request.
   */
  type?: HumanFeedbackType

  /**
   * Whether the user can bail out of the feedback loop.
   */
  bail?: boolean

  /**
   * Whether the user can edit the output.
   */
  editing?: boolean

  /**
   * Whether the user can add free-form text annotations.
   */
  annotations?: boolean

  /**
   * The human feedback mechanism to use for this task.
   */
  mechanism?: HumanFeedbackMechanismConstructor<T>
}

export abstract class HumanFeedbackMechanism {
  protected _agentic: Agentic

  protected _options: HumanFeedbackOptions

  constructor({
    agentic,
    options
  }: {
    agentic: Agentic
    options: HumanFeedbackOptions
  }) {
    this._agentic = agentic
    this._options = options
  }

  public abstract confirm(
    response: any,
    metadata: TaskResponseMetadata
  ): Promise<void>
  public abstract selectOne(
    response: any,
    metadata: TaskResponseMetadata
  ): Promise<void>
  public abstract selectN(
    response: any,
    metadata: TaskResponseMetadata
  ): Promise<void>

  public async interact(response: any, metadata: TaskResponseMetadata) {
    if (this._options.type === 'selectN') {
      await this.selectN(response, metadata)
    } else if (this._options.type === 'confirm') {
      await this.confirm(response, metadata)
    } else if (this._options.type === 'selectOne') {
      await this.selectOne(response, metadata)
    }
  }
}

export function withHumanFeedback<T, U>(
  task: BaseTask<T, U>,
  options: HumanFeedbackOptions = {}
) {
  task = task.clone()

  // Default options defined at the instance level
  const instanceDefaults = task.agentic.humanFeedbackDefaults

  // Use Object.assign to merge the options, instance defaults, and hard-coded defaults
  const finalOptions: HumanFeedbackOptions = Object.assign(
    {
      type: 'confirm',
      bail: false,
      editing: false,
      annotations: false,
      mechanism: HumanFeedbackMechanismCLI
    },
    // Defaults from the instance:
    instanceDefaults,
    // User-provided options (override instance defaults):
    options
  )

  if (!finalOptions.mechanism) {
    throw new Error(
      'No feedback mechanism provided. Please provide a feedback mechanism to use.'
    )
  }

  const feedbackMechanism = new finalOptions.mechanism({
    agentic: task.agentic,
    options: finalOptions
  })

  const originalCall = task.callWithMetadata.bind(task)

  task.callWithMetadata = async function (input?: T) {
    const response = await originalCall(input)

    // Process the response and add feedback to metadata
    await feedbackMechanism.interact(response.result, response.metadata)

    return response
  }

  return task
}
