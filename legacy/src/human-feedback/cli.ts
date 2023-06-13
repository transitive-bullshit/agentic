import checkbox from '@inquirer/checkbox'
import editor from '@inquirer/editor'
import input from '@inquirer/input'
import select from '@inquirer/select'

import { Agentic } from '@/agentic'

import {
  HumanFeedbackMechanism,
  HumanFeedbackOptions,
  UserActionMessages,
  UserActions
} from './feedback'

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

  /**
   * Prompt the user to select one of a list of options.
   */
  protected async askUser(
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
