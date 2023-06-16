import * as types from '@/types'
import { Agentic } from '@/agentic'
import { HumanFeedbackDeclineError } from '@/errors'
import { BaseTask } from '@/task'

import { HumanFeedbackMechanismCLI } from './cli'

/**
 * Actions the user can take in the feedback selection prompt.
 */
export const HumanFeedbackUserActions = {
  Accept: 'accept',
  Edit: 'edit',
  Decline: 'decline',
  Select: 'select',
  Abort: 'abort'
} as const

export type HumanFeedbackUserActions =
  (typeof HumanFeedbackUserActions)[keyof typeof HumanFeedbackUserActions]

export const HumanFeedbackUserActionMessages: Record<
  HumanFeedbackUserActions,
  string
> = {
  [HumanFeedbackUserActions.Accept]: 'Accept the output',
  [HumanFeedbackUserActions.Edit]: 'Edit the output',
  [HumanFeedbackUserActions.Decline]: 'Decline the output',
  [HumanFeedbackUserActions.Select]: 'Select outputs to keep',
  [HumanFeedbackUserActions.Abort]: 'Abort'
}

/**
 * Available types of human feedback.
 */
export type HumanFeedbackType = 'confirm' | 'selectOne' | 'selectN'

type HumanFeedbackMechanismConstructor<
  T extends HumanFeedbackType,
  TOutput = any
> = new (...args: any[]) => HumanFeedbackMechanism<T, TOutput>

/**
 * Options for human feedback.
 */
export type HumanFeedbackOptions<T extends HumanFeedbackType, TOutput> = {
  /**
   * What type of feedback to request.
   */
  type?: T

  /**
   * Whether the user can abort the process.
   */
  abort?: boolean

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
  mechanism?: HumanFeedbackMechanismConstructor<T, TOutput>

  /**
   * Custom label to be displayed along with the output when requesting feedback.
   */
  outputLabel?: string

  /**
   * Timeout in milliseconds after which waiting for any user input is aborted (default: +Infinity, i.e. no timeout.)
   */
  timeoutMs?: number
}

export interface BaseHumanFeedbackMetadata {
  /**
   * Edited output by the user (if applicable).
   */
  editedOutput?: any

  /**
   * Annotation left by the user (if applicable).
   */
  annotation?: string
}

export interface HumanFeedbackConfirmMetadata
  extends BaseHumanFeedbackMetadata {
  /**
   * The type of feedback requested.
   */
  type: 'confirm'

  /**
   * Whether the user accepted the output.
   */
  accepted: boolean
}

export interface HumanFeedbackSelectOneMetadata
  extends BaseHumanFeedbackMetadata {
  /**
   * The type of feedback requested.
   */
  type: 'selectOne'

  /**
   * The selected output.
   */
  chosen: any
}

export interface HumanFeedbackSelectNMetadata
  extends BaseHumanFeedbackMetadata {
  /**
   * The type of feedback requested.
   */
  type: 'selectN'

  /**
   * The selected outputs.
   */
  selected: any[]
}

export type FeedbackTypeToMetadata<T extends HumanFeedbackType> =
  T extends 'confirm'
    ? HumanFeedbackConfirmMetadata
    : T extends 'selectOne'
    ? HumanFeedbackSelectOneMetadata
    : HumanFeedbackSelectNMetadata

export abstract class HumanFeedbackMechanism<
  T extends HumanFeedbackType,
  TOutput
> {
  protected _agentic: Agentic

  protected _task: BaseTask

  protected _options: Required<HumanFeedbackOptions<T, TOutput>>

  constructor({
    task,
    options
  }: {
    task: BaseTask
    options: Required<HumanFeedbackOptions<T, TOutput>>
  }) {
    this._agentic = task.agentic
    this._task = task
    this._options = options
  }

  protected abstract _selectOne(
    output: TOutput
  ): Promise<TOutput extends any[] ? TOutput[0] : never>

  protected abstract _selectN(
    response: TOutput
  ): Promise<TOutput extends any[] ? TOutput : never>

  protected abstract _annotate(): Promise<string>

  protected abstract _edit(output: string): Promise<string>

  protected abstract _askUser(
    message: string,
    choices: HumanFeedbackUserActions[]
  ): Promise<HumanFeedbackUserActions>

  protected _parseEditedOutput(editedOutput: string): any {
    const parsedOutput = JSON.parse(editedOutput)
    return this._task.outputSchema.parse(parsedOutput)
  }

  public async interact(output: TOutput): Promise<FeedbackTypeToMetadata<T>> {
    const stringified = JSON.stringify(output, null, 2)
    const taskDetails = `${this._task.nameForHuman} (ID: ${this._task.id})`
    const outputLabel =
      this._options.outputLabel || 'The following output was generated:'
    const msg = [
      taskDetails,
      outputLabel,
      '```',
      stringified,
      '```',
      'What would you like to do?'
    ].join('\n')

    const choices: HumanFeedbackUserActions[] = []
    if (
      this._options.type === 'selectN' ||
      this._options.type === 'selectOne'
    ) {
      choices.push(HumanFeedbackUserActions.Select)
    } else {
      // Case: confirm
      choices.push(HumanFeedbackUserActions.Accept)
      choices.push(HumanFeedbackUserActions.Decline)
    }

    if (this._options.editing) {
      choices.push(HumanFeedbackUserActions.Edit)
    }

    if (this._options.abort) {
      choices.push(HumanFeedbackUserActions.Abort)
    }

    const choice =
      choices.length === 1
        ? HumanFeedbackUserActions.Select
        : await this._askUser(msg, choices)

    const feedback: Record<string, any> = {
      type: this._options.type
    }

    switch (choice) {
      case HumanFeedbackUserActions.Accept:
        feedback.accepted = true
        break

      case HumanFeedbackUserActions.Edit: {
        const editedOutput = await this._edit(stringified)
        feedback.editedOutput = await this._parseEditedOutput(editedOutput)
        break
      }

      case HumanFeedbackUserActions.Decline:
        feedback.accepted = false
        break

      case HumanFeedbackUserActions.Select:
        if (this._options.type === 'selectN') {
          if (!Array.isArray(output)) {
            throw new Error('Expected output to be an array')
          }

          feedback.selected = await this._selectN(output)
        } else if (this._options.type === 'selectOne') {
          if (!Array.isArray(output)) {
            throw new Error('Expected output to be an array')
          }

          feedback.chosen = await this._selectOne(output)
        }

        break

      case HumanFeedbackUserActions.Abort:
        throw new Error('Aborting...')

      default:
        throw new Error(`Unexpected choice: ${choice}`)
    }

    if (this._options.annotations) {
      const annotation = await this._annotate()
      if (annotation) {
        feedback.annotation = annotation
      }
    }

    if (
      (Object.hasOwnProperty.call(feedback, 'accepted') &&
        feedback.accepted === false) ||
      (Object.hasOwnProperty.call(feedback, 'selected') &&
        feedback.selected.length === 0)
    ) {
      const errorMsg = [
        'The output was declined by the human reviewer.',
        'Output:',
        '```',
        stringified,
        '```',
        '',
        'Please try again and return different output.'
      ].join('\n')
      throw new HumanFeedbackDeclineError(errorMsg, {
        context: feedback
      })
    }

    return feedback as FeedbackTypeToMetadata<T>
  }
}

export function withHumanFeedback<
  TInput extends types.TaskInput,
  TOutput extends types.TaskOutput,
  V extends HumanFeedbackType
>(
  task: BaseTask<TInput, TOutput>,
  options: HumanFeedbackOptions<V, TOutput> = {}
) {
  task = task.clone()

  // Use Object.assign to merge the options, instance defaults, and hard-coded defaults:
  const finalOptions: HumanFeedbackOptions<V, TOutput> = Object.assign(
    {
      type: 'confirm',
      abort: false,
      editing: false,
      annotations: false,
      timeoutMs: Number.POSITIVE_INFINITY,
      mechanism: HumanFeedbackMechanismCLI
    },
    // Default options from the instance:
    task.agentic.humanFeedbackDefaults,
    // User-provided options (override instance defaults):
    options
  )

  if (!finalOptions.mechanism) {
    throw new Error(
      'No feedback mechanism provided. Please provide a feedback mechanism to use.'
    )
  }

  const feedbackMechanism = new finalOptions.mechanism({
    task: task,
    options: finalOptions
  })

  task.addAfterCallHook(async function onCall(output, ctx) {
    const feedback = await feedbackMechanism.interact(output)
    ctx.metadata = { ...ctx.metadata, feedback }
  })

  return task
}
