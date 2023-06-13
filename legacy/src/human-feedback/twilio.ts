import { Agentic } from '@/agentic'
import { TwilioConversationClient } from '@/services/twilio-conversation'
import { TaskResponseMetadata } from '@/types'

import {
  HumanFeedbackMechanism,
  HumanFeedbackOptions,
  UserActionMessages,
  UserActions
} from './feedback'

export class HumanFeedbackMechanismTwilio extends HumanFeedbackMechanism {
  private twilioClient: TwilioConversationClient

  constructor({
    agentic,
    options
  }: {
    agentic: Agentic
    options: HumanFeedbackOptions
  }) {
    super({ agentic, options })
    this.twilioClient = new TwilioConversationClient()
  }

  private async askUser(
    message: string,
    choices: UserActions[]
  ): Promise<UserActions> {
    message += '\n\n'
    message += choices
      .map((choice, idx) => `*${idx}* - ${UserActionMessages[choice]}`)
      .join('\n')
    message += '\n\n'
    message += 'Reply with the number of your choice.'
    const response = await this.twilioClient.sendAndWaitForReply({
      name: 'human-feedback-ask',
      text: message,
      validate: (message) => {
        const choice = parseInt(message.body)
        return !isNaN(choice) && choice >= 0 && choice < choices.length
      }
    })
    return choices[parseInt(response.body)]
  }

  public async confirm(
    response: any,
    metadata: TaskResponseMetadata
  ): Promise<void> {
    const stringified = JSON.stringify(response, null, 2)
    const msg = [
      'The following output was generated:',
      '',
      stringified,
      '',
      'What would you like to do?'
    ].join('\n')

    const choices: UserActions[] = [UserActions.Accept, UserActions.Decline]

    if (this._options.editing) {
      choices.push(UserActions.Edit)
    }

    if (this._options.bail) {
      choices.push(UserActions.Exit)
    }

    const feedback = await this.askUser(msg, choices)

    metadata.feedback = {}

    switch (feedback) {
      case UserActions.Accept:
        metadata.feedback.accepted = true
        break

      case UserActions.Edit: {
        let { body: editedOutput } =
          await this.twilioClient.sendAndWaitForReply({
            name: 'human-feedback-edit',
            text: 'Copy and edit the output:'
          })
        editedOutput = editedOutput.replace(/```$/g, '')
        editedOutput = editedOutput.replace(/^```/g, '')
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
      try {
        const annotation = await this.twilioClient.sendAndWaitForReply({
          name: 'human-feedback-annotation',
          text: 'Please leave an annotation (optional):'
        })

        if (annotation) {
          metadata.feedback.annotation = annotation.body
        }
      } catch (e) {
        // Deliberately swallow the error here as the user is not required to leave an annotation
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
      '',
      stringified,
      '',
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
      choices.length === 1
        ? UserActions.Select
        : await this.askUser(msg, choices)

    metadata.feedback = {}

    switch (feedback) {
      case UserActions.Edit: {
        let { body: editedOutput } =
          await this.twilioClient.sendAndWaitForReply({
            text: 'Copy and edit the output:',
            name: 'human-feedback-edit'
          })
        editedOutput = editedOutput.replace(/```$/g, '')
        editedOutput = editedOutput.replace(/^```/g, '')
        metadata.feedback.editedOutput = editedOutput
        break
      }

      case UserActions.Select: {
        const { body: selectedOutput } =
          await this.twilioClient.sendAndWaitForReply({
            name: 'human-feedback-select',
            text:
              'Pick one output:' +
              response.map((r, idx) => `\n${idx} - ${r}`).join('') +
              '\n\nReply with the number of your choice.',
            validate: (message) => {
              const choice = parseInt(message.body)
              return !isNaN(choice) && choice >= 0 && choice < response.length
            }
          })
        metadata.feedback.chosen = response[parseInt(selectedOutput)]
        break
      }

      case UserActions.Exit:
        throw new Error('Exiting...')

      default:
        throw new Error(`Unexpected feedback: ${feedback}`)
    }

    if (this._options.annotations) {
      try {
        const annotation = await this.twilioClient.sendAndWaitForReply({
          text: 'Please leave an annotation (optional):',
          name: 'human-feedback-annotation'
        })

        if (annotation) {
          metadata.feedback.annotation = annotation.body
        }
      } catch (e) {
        // Deliberately swallow the error here as the user is not required to leave an annotation
      }
    }
  }

  public async selectN(
    response: any[],
    metadata: TaskResponseMetadata
  ): Promise<void> {
    const stringified = JSON.stringify(response, null, 2)
    const msg = [
      'The following output was generated:',
      '',
      stringified,
      '',
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
      choices.length === 1
        ? UserActions.Select
        : await this.askUser(msg, choices)

    metadata.feedback = {}

    switch (feedback) {
      case UserActions.Edit: {
        let { body: editedOutput } =
          await this.twilioClient.sendAndWaitForReply({
            text: 'Copy and edit the output:',
            name: 'human-feedback-edit'
          })
        editedOutput = editedOutput.replace(/```$/g, '')
        editedOutput = editedOutput.replace(/^```/g, '')
        metadata.feedback.editedOutput = editedOutput
        break
      }

      case UserActions.Select: {
        const { body: selectedOutput } =
          await this.twilioClient.sendAndWaitForReply({
            name: 'human-feedback-select',
            text:
              'Select outputs:' +
              response.map((r, idx) => `\n${idx} - ${r}`).join('') +
              '\n\nReply with a comma-separated list of the output numbers of your choice.',
            validate: (message) => {
              const choices = message.body.split(',')
              return choices.every((choice) => {
                const choiceInt = parseInt(choice)
                return (
                  !isNaN(choiceInt) &&
                  choiceInt >= 0 &&
                  choiceInt < response.length
                )
              })
            }
          })
        const chosenOutputs = selectedOutput
          .split(',')
          .map((choice) => parseInt(choice))
        metadata.feedback.selected = response.filter((_, idx) => {
          return chosenOutputs.includes(idx)
        })
        break
      }

      case UserActions.Exit:
        throw new Error('Exiting...')

      default:
        throw new Error(`Unexpected feedback: ${feedback}`)
    }

    if (this._options.annotations) {
      try {
        const annotation = await this.twilioClient.sendAndWaitForReply({
          text: 'Please leave an annotation (optional):',
          name: 'human-feedback-annotation'
        })

        if (annotation) {
          metadata.feedback.annotation = annotation.body
        }
      } catch (e) {
        // Deliberately swallow the error here as the user is not required to leave an annotation
      }
    }
  }
}
