import { Agentic } from '@/agentic'
import { HumanFeedbackDeclineError } from '@/errors'
import { BaseTask } from '@/task'

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
export type HumanFeedbackType = 'confirm' | 'select' | 'multiselect'

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

export interface HumanFeedbackSelectMetadata extends BaseHumanFeedbackMetadata {
  /**
   * The type of feedback requested.
   */
  type: 'select'

  /**
   * The selected output.
   */
  chosen: any
}

export interface HumanFeedbackMultiselectMetadata
  extends BaseHumanFeedbackMetadata {
  /**
   * The type of feedback requested.
   */
  type: 'multiselect'

  /**
   * The selected outputs.
   */
  selected: any[]
}

export type FeedbackTypeToMetadata<T extends HumanFeedbackType> =
  T extends 'confirm'
    ? HumanFeedbackConfirmMetadata
    : T extends 'select'
    ? HumanFeedbackSelectMetadata
    : HumanFeedbackMultiselectMetadata

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

  protected abstract _select(
    output: TOutput
  ): Promise<TOutput extends any[] ? TOutput[0] : never>

  protected abstract _multiselect(
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
      this._options.type === 'multiselect' ||
      this._options.type === 'select'
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

    this._agentic.logger.info(
      choices,
      `>>> Human feedback ${this.constructor.name} ${msg}`
    )

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
        if (this._options.type === 'multiselect') {
          if (!Array.isArray(output)) {
            throw new Error('Expected output to be an array')
          }

          feedback.selected = await this._multiselect(output)
        } else if (this._options.type === 'select') {
          if (!Array.isArray(output)) {
            throw new Error('Expected output to be an array')
          }

          feedback.chosen = await this._select(output)
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

    this._agentic.logger.info(
      feedback,
      `<<< Human feedback ${this.constructor.name} ${msg}`
    )
    return feedback as FeedbackTypeToMetadata<T>
  }
}
