import * as types from '@/types'
import { Agentic } from '@/agentic'
import { BaseTask } from '@/task'

export type HumanFeedbackType = 'confirm' | 'selectOne' | 'selectN'

export type HumanFeedbackOptions = {
  type: HumanFeedbackType

  /**
   * Whether to allow exiting
   */
  bail?: boolean

  editing?: boolean

  annotations?: boolean

  feedbackMechanism?: HumanFeedbackMechanism
}

export abstract class HumanFeedbackMechanism {
  protected _agentic: Agentic

  constructor({ agentic }: { agentic: Agentic }) {
    this._agentic = agentic
  }
  // TODO
}

export class HumanFeedbackMechanismCLI extends HumanFeedbackMechanism {
  // TODO
  constructor(opts: { agentic: Agentic }) {
    super(opts)
  }
}

export function withHumanFeedback<
  TInput extends void | types.JsonObject = void,
  TOutput extends types.JsonValue = string
>(
  task: BaseTask<TInput, TOutput>,
  options: HumanFeedbackOptions = {
    type: 'confirm',
    bail: false,
    editing: false,
    annotations: false
  }
) {
  const { feedbackMechanism = task.agentic.defaultHumanFeedbackMechamism } =
    options

  // TODO
  return task
}
