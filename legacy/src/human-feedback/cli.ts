import checkbox from '@inquirer/checkbox'
import editor from '@inquirer/editor'
import input from '@inquirer/input'
import select from '@inquirer/select'

import { Agentic } from '@/agentic'
import { TaskResponseMetadata } from '@/types'

import {
  HumanFeedbackMechanism,
  HumanFeedbackOptions,
  UserActionMessages,
  UserActions
} from './feedback'

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
