import checkbox from '@inquirer/checkbox'
import editor from '@inquirer/editor'
import input from '@inquirer/input'
import select from '@inquirer/select'

import {
  HumanFeedbackMechanism,
  HumanFeedbackType,
  HumanFeedbackUserActionMessages,
  HumanFeedbackUserActions
} from './feedback'

export class HumanFeedbackMechanismCLI<
  T extends HumanFeedbackType,
  TOutput = any
> extends HumanFeedbackMechanism<T, TOutput> {
  /**
   * Prompt the user to select one of a list of options.
   */
  protected async askUser(
    message: string,
    choices: HumanFeedbackUserActions[]
  ): Promise<HumanFeedbackUserActions> {
    return select({
      message,
      choices: choices.map((choice) => ({
        name: HumanFeedbackUserActionMessages[choice],
        value: choice
      }))
    })
  }

  protected async edit(output: string): Promise<string> {
    return editor({
      message: 'Edit the output:',
      default: output
    })
  }

  protected async annotate(): Promise<string> {
    return input({
      message:
        'Please leave an annotation (leave blank to skip; press enter to submit):'
    })
  }

  protected async selectOne(
    response: TOutput
  ): Promise<TOutput extends (infer U)[] ? U : never> {
    if (!Array.isArray(response)) {
      throw new Error('selectOne called on non-array response')
    }

    const choices = response.map((option) => ({
      name: String(option),
      value: option
    }))
    return select({ message: 'Pick one output:', choices })
  }

  protected async selectN(
    response: TOutput
  ): Promise<TOutput extends any[] ? TOutput : never> {
    if (!Array.isArray(response)) {
      throw new Error('selectN called on non-array response')
    }

    const choices = response.map((option) => ({
      name: String(option),
      value: option
    }))
    return checkbox({ message: 'Select outputs:', choices }) as any
  }
}
