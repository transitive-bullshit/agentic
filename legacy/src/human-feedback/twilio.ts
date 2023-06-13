import { Agentic } from '@/agentic'
import { TwilioConversationClient } from '@/services/twilio-conversation'

import {
  HumanFeedbackMechanism,
  HumanFeedbackOptions,
  HumanFeedbackType,
  HumanFeedbackUserActionMessages,
  HumanFeedbackUserActions
} from './feedback'

export class HumanFeedbackMechanismTwilio<
  T extends HumanFeedbackType
> extends HumanFeedbackMechanism<T> {
  private twilioClient: TwilioConversationClient

  constructor({
    agentic,
    options
  }: {
    agentic: Agentic
    options: Required<HumanFeedbackOptions<T>>
  }) {
    super({ agentic, options })
    this.twilioClient = new TwilioConversationClient()
  }

  protected async annotate(): Promise<string> {
    try {
      const annotation = await this.twilioClient.sendAndWaitForReply({
        name: 'human-feedback-annotation',
        text: 'Please leave an annotation (optional):'
      })
      return annotation.body
    } catch (e) {
      // Deliberately swallow the error here as the user is not required to leave an annotation
      return ''
    }
  }

  protected async edit(): Promise<string> {
    let { body: editedOutput } = await this.twilioClient.sendAndWaitForReply({
      text: 'Copy and edit the output:',
      name: 'human-feedback-edit'
    })
    editedOutput = editedOutput.replace(/```$/g, '')
    editedOutput = editedOutput.replace(/^```/g, '')
    return editedOutput
  }

  protected async askUser(
    message: string,
    choices: HumanFeedbackUserActions[]
  ): Promise<HumanFeedbackUserActions> {
    message += '\n\n'
    message += choices
      .map(
        (choice, idx) => `${idx} - ${HumanFeedbackUserActionMessages[choice]}`
      )
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

  public async selectOne(response: any[]): Promise<any> {
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
    return response[parseInt(selectedOutput)]
  }

  public async selectN(response: any[]): Promise<any[]> {
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
              !isNaN(choiceInt) && choiceInt >= 0 && choiceInt < response.length
            )
          })
        }
      })
    const chosenOutputs = selectedOutput
      .split(',')
      .map((choice) => parseInt(choice))
    return response.filter((_, idx) => {
      return chosenOutputs.includes(idx)
    })
  }
}
