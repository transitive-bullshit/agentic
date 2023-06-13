import { Agentic } from '@/agentic'
import { BaseTask } from '@/task'
import { TaskResponseMetadata } from '@/types'

import { HumanFeedbackMechanismCLI } from './cli'

/**
 * Actions the user can take in the feedback selection prompt.
 */
export const UserActions = {
  Accept: 'accept',
  Edit: 'edit',
  Decline: 'decline',
  Select: 'select',
  Exit: 'exit'
} as const

export type UserActions = (typeof UserActions)[keyof typeof UserActions]

export const UserActionMessages: Record<UserActions, string> = {
  [UserActions.Accept]: 'Accept the output',
  [UserActions.Edit]: 'Edit the output',
  [UserActions.Decline]: 'Decline the output',
  [UserActions.Select]: 'Select outputs to keep',
  [UserActions.Exit]: 'Exit'
}

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

  protected abstract selectOne(response: any): Promise<any>

  protected abstract selectN(response: any): Promise<any>

  protected abstract annotate(): Promise<string>

  protected abstract edit(output: string): Promise<string>

  protected abstract askUser(
    message: string,
    choices: UserActions[]
  ): Promise<UserActions>

  public async interact(response: any, metadata: TaskResponseMetadata) {
    const stringified = JSON.stringify(response, null, 2)
    const msg = [
      'The following output was generated:',
      '```',
      stringified,
      '```',
      'What would you like to do?'
    ].join('\n')

    const choices: UserActions[] = []
    if (
      this._options.type === 'selectN' ||
      this._options.type === 'selectOne'
    ) {
      choices.push(UserActions.Select)
    } else {
      // Case: confirm
      choices.push(UserActions.Accept)
      choices.push(UserActions.Decline)
    }

    if (this._options.editing) {
      choices.push(UserActions.Edit)
    }

    if (this._options.bail) {
      choices.push(UserActions.Exit)
    }

    const feedback =
      choices.length === 1
        ? UserActions.Select
        : await this.askUser(msg, choices)

    metadata.feedback = {}

    switch (feedback) {
      case UserActions.Accept:
        metadata.feedback.accepted = true
        break

      case UserActions.Edit: {
        const editedOutput = await this.edit(stringified)
        metadata.feedback.editedOutput = editedOutput
        break
      }

      case UserActions.Decline:
        metadata.feedback.accepted = false
        break

      case UserActions.Select:
        if (this._options.type === 'selectN') {
          metadata.feedback.selected = await this.selectN(response)
        } else if (this._options.type === 'selectOne') {
          metadata.feedback.chosen = await this.selectOne(response)
        }

        break

      case UserActions.Exit:
        throw new Error('Exiting...')

      default:
        throw new Error(`Unexpected feedback: ${feedback}`)
    }

    if (this._options.annotations) {
      const annotation = await this.annotate()
      if (annotation) {
        metadata.feedback.annotation = annotation
      }
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
