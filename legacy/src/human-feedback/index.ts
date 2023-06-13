import checkbox from '@inquirer/checkbox'
import editor from '@inquirer/editor'
import input from '@inquirer/input'
import select from '@inquirer/select'

import { Agentic } from '@/agentic'
import { BaseTask } from '@/task'
import { TaskResponseMetadata } from '@/types'

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

const UserActionMessages: Record<UserActions, string> = {
  [UserActions.Accept]: 'Accept the output',
  [UserActions.Edit]: 'Edit the output (open in editor)',
  [UserActions.Decline]: 'Decline the output',
  [UserActions.Select]: 'Select outputs to keep',
  [UserActions.Exit]: 'Exit'
}

/**
 * Prompt the user to select one of a list of options.
 */
async function askUser(
  message: string,
  choices: UserActions[]
): Promise<UserActions> {
  return select({
    message,
    choices: choices.map((choice) => ({
      name: UserActionMessages[choice],
      value: choice
    }))
  })
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

export class HumanFeedbackMechanismCLI extends HumanFeedbackMechanism {
  constructor({
    agentic,
    options
  }: {
    agentic: Agentic
    options: HumanFeedbackOptions
  }) {
    super({ agentic, options })
    this._agentic = agentic
    this._options = options
  }

  public async confirm(
    response: any,
    metadata: TaskResponseMetadata
  ): Promise<void> {
    const stringified = JSON.stringify(response, null, 2)
    const msg = [
      'The following output was generated:',
      stringified,
      'What would you like to do?'
    ].join('\n')
    const choices: UserActions[] = [UserActions.Accept, UserActions.Decline]

    if (this._options.editing) {
      choices.push(UserActions.Edit)
    }

    if (this._options.bail) {
      choices.push(UserActions.Exit)
    }

    const feedback = await askUser(msg, choices)

    metadata.feedback = {}

    switch (feedback) {
      case UserActions.Accept:
        metadata.feedback.accepted = true
        break

      case UserActions.Edit: {
        const editedOutput = await editor({
          message: 'Edit the output:',
          default: stringified
        })
        metadata.feedback.editedOutput = editedOutput
        break
      }

      case UserActions.Decline:
        metadata.feedback.accepted = false
        break

      case UserActions.Exit:
        throw new Error('Exiting...')

      default:
        throw new Error(`Unexpected feedback: ${feedback}`)
    }

    if (this._options.annotations) {
      const annotation = await input({
        message:
          'Please leave an annotation (leave blank to skip; press enter to submit):'
      })
      if (annotation) {
        metadata.feedback.annotation = annotation
      }
    }
  }

  public async selectOne(
    response: any[],
    metadata: TaskResponseMetadata
  ): Promise<void> {
    const stringified = JSON.stringify(response, null, 2)
    const msg = [
      'The following output was generated:',
      stringified,
      'What would you like to do?'
    ].join('\n')
    const choices: UserActions[] = [UserActions.Select]

    if (this._options.editing) {
      choices.push(UserActions.Edit)
    }

    if (this._options.bail) {
      choices.push(UserActions.Exit)
    }

    const feedback = await askUser(msg, choices)

    metadata.feedback = {}

    switch (feedback) {
      case UserActions.Edit: {
        const editedOutput = await editor({
          message: 'Edit the output:',
          default: stringified
        })
        metadata.feedback.editedOutput = editedOutput
        break
      }

      case UserActions.Select: {
        const choices = response.map((option) => ({
          name: option,
          value: option
        }))
        const chosen = await select({ message: 'Pick one output:', choices })
        metadata.feedback.chosen = chosen
        break
      }

      case UserActions.Exit:
        throw new Error('Exiting...')

      default:
        throw new Error(`Unexpected feedback: ${feedback}`)
    }
  }

  public async selectN(
    response: any[],
    metadata: TaskResponseMetadata
  ): Promise<void> {
    const stringified = JSON.stringify(response, null, 2)
    const msg = [
      'The following output was generated:',
      stringified,
      'What would you like to do?'
    ].join('\n')
    const choices: UserActions[] = [UserActions.Select]

    if (this._options.editing) {
      choices.push(UserActions.Edit)
    }

    if (this._options.bail) {
      choices.push(UserActions.Exit)
    }

    const feedback =
      choices.length === 1 ? UserActions.Select : await askUser(msg, choices)

    metadata.feedback = {}

    switch (feedback) {
      case UserActions.Edit: {
        const editedOutput = await editor({
          message: 'Edit the output:',
          default: stringified
        })
        metadata.feedback.editedOutput = editedOutput
        break
      }

      case UserActions.Select: {
        const choices = response.map((option) => ({
          name: option,
          value: option
        }))
        const chosen = await checkbox({ message: 'Select outputs:', choices })
        metadata.feedback.selected = chosen
        break
      }

      case UserActions.Exit:
        throw new Error('Exiting...')

      default:
        throw new Error(`Unexpected feedback: ${feedback}`)
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
