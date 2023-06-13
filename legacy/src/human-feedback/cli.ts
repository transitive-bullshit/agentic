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
  T extends HumanFeedbackType
> extends HumanFeedbackMechanism<T> {
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

  protected async selectOne(response: any[]): Promise<void> {
    const choices = response.map((option) => ({
      name: option,
      value: option
    }))
    return select({ message: 'Pick one output:', choices })
  }

  protected async selectN(response: any[]): Promise<any[]> {
    const choices = response.map((option) => ({
      name: option,
      value: option
    }))
    return checkbox({ message: 'Select outputs:', choices })
  }
}
