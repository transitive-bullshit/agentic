import { SlackClient } from '@/services/slack'
import { BaseTask } from '@/task'

import {
  HumanFeedbackMechanism,
  HumanFeedbackOptions,
  HumanFeedbackType,
  HumanFeedbackUserActionMessages,
  HumanFeedbackUserActions
} from './feedback'

export class HumanFeedbackMechanismSlack<
  T extends HumanFeedbackType,
  TOutput = any
> extends HumanFeedbackMechanism<T, TOutput> {
  private slackClient: SlackClient

  constructor({
    task,
    options
  }: {
    task: BaseTask
    options: Required<HumanFeedbackOptions<T, TOutput>>
  }) {
    super({ task, options })
    this.slackClient = new SlackClient()
  }

  protected async annotate(): Promise<string> {
    try {
      const annotation = await this.slackClient.sendAndWaitForReply({
        text: 'Please leave an annotation (optional):'
      })
      return annotation.text
    } catch (e) {
      // Deliberately swallow the error here as the user is not required to leave an annotation
      return ''
    }
  }

  protected async edit(): Promise<string> {
    let { text: editedOutput } = await this.slackClient.sendAndWaitForReply({
      text: 'Copy and edit the output:'
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
        (choice, idx) => `*${idx}* - ${HumanFeedbackUserActionMessages[choice]}`
      )
      .join('\n')
    message += '\n\n'
    message += 'Reply with the number of your choice.'
    const response = await this.slackClient.sendAndWaitForReply({
      text: message,
      validate: (slackMessage) => {
        const choice = parseInt(slackMessage.text)
        return !isNaN(choice) && choice >= 0 && choice < choices.length
      }
    })
    return choices[parseInt(response.text)]
  }

  protected async selectOne(
    response: TOutput
  ): Promise<TOutput extends (infer U)[] ? U : never> {
    if (!Array.isArray(response)) {
      throw new Error('selectOne called on non-array response')
    }

    const { text: selectedOutput } = await this.slackClient.sendAndWaitForReply(
      {
        text:
          'Pick one output:' +
          response.map((r, idx) => `\n*${idx}* - ${r}`).join('') +
          '\n\nReply with the number of your choice.',
        validate: (slackMessage) => {
          const choice = parseInt(slackMessage.text)
          return !isNaN(choice) && choice >= 0 && choice < response.length
        }
      }
    )
    return response[parseInt(selectedOutput)]
  }

  protected async selectN(
    response: TOutput
  ): Promise<TOutput extends any[] ? TOutput : never> {
    if (!Array.isArray(response)) {
      throw new Error('selectN called on non-array response')
    }

    const { text: selectedOutput } = await this.slackClient.sendAndWaitForReply(
      {
        text:
          'Select outputs:' +
          response.map((r, idx) => `\n*${idx}* - ${r}`).join('') +
          '\n\nReply with a comma-separated list of the output numbers of your choice.',
        validate: (slackMessage) => {
          const choices = slackMessage.text.split(',')
          return choices.every((choice) => {
            const choiceInt = parseInt(choice)
            return (
              !isNaN(choiceInt) && choiceInt >= 0 && choiceInt < response.length
            )
          })
        }
      }
    )
    const chosenOutputs = selectedOutput
      .split(',')
      .map((choice) => parseInt(choice))
    return response.filter((_, idx) => {
      return chosenOutputs.includes(idx)
    }) as any
  }
}
