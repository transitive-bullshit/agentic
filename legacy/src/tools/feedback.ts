import { checkbox, editor, select } from '@inquirer/prompts'
import { ZodTypeAny, z } from 'zod'

import * as types from './../types'
import { BaseTaskCallBuilder } from './../task'

enum UserActions {
  Accept = 'accept',
  Edit = 'edit',
  Decline = 'decline',
  Select = 'select'
}

const UserActionMessages = {
  [UserActions.Accept]: 'Accept inputs',
  [UserActions.Edit]: 'Edit (open in editor)',
  [UserActions.Decline]: 'Decline',
  [UserActions.Select]: 'Select inputs to keep'
}

export const FeedbackSingleInputSchema = <T extends ZodTypeAny>(choice: T) =>
  z.object({
    choice
  })

export const FeedbackSingleOutputSchema = <T extends ZodTypeAny>(result: T) =>
  z.object({
    result: result,
    accepted: z.boolean()
  })

export class HumanFeedbackSingle<
  T extends ZodTypeAny = ZodTypeAny
> extends BaseTaskCallBuilder<ZodTypeAny, ZodTypeAny> {
  private choiceSchema: T

  constructor(choiceSchema: T) {
    super()
    this.choiceSchema = choiceSchema
  }

  public get inputSchema() {
    return FeedbackSingleInputSchema(this.choiceSchema)
  }

  public get outputSchema() {
    return FeedbackSingleOutputSchema(this.choiceSchema)
  }

  private async handleChoice(
    input: types.ParsedData<typeof this.inputSchema>
  ): Promise<types.ParsedData<typeof this.outputSchema>> {
    const feedback = await select({
      message: [
        'The following input was generated:',
        JSON.stringify(input.choice, null, 2),
        'What would you like to do?'
      ].join('\n'),
      choices: [
        {
          name: UserActionMessages[UserActions.Accept],
          value: UserActions.Accept
        },
        {
          name: UserActionMessages[UserActions.Edit],
          value: UserActions.Edit
        },
        {
          name: UserActionMessages[UserActions.Decline],
          value: UserActions.Decline
        }
      ]
    })
    switch (feedback) {
      case UserActions.Edit: {
        // Open the completion in the user's default editor
        const editedInput = await editor({
          message: 'Edit the input:',
          default: JSON.stringify(input.choice)
        })
        return {
          result: this.choiceSchema.parse(JSON.parse(editedInput)),
          accepted: true
        }
      }
      case UserActions.Decline:
        return { result: null, accepted: false }
      case UserActions.Accept:
        return { result: input, accepted: true }
      default:
        throw new Error('Invalid feedback choice')
    }
  }

  public async call(
    input: types.ParsedData<typeof this.inputSchema>
  ): Promise<types.ParsedData<typeof this.outputSchema>> {
    try {
      input = this.inputSchema.parse(input)
      return this.handleChoice(input)
    } catch (err) {
      console.error('Error parsing input:', err)
      throw err
    }
  }
}

export const FeedbackSelectInputSchema = <T extends ZodTypeAny>(choice: T) =>
  z.object({
    choices: z.array(choice)
  })

export const FeedbackSelectOutputSchema = <T extends ZodTypeAny>(result: T) =>
  z.object({
    results: z.array(result),
    accepted: z.boolean()
  })

export class HumanFeedbackSelect<
  T extends ZodTypeAny = ZodTypeAny
> extends BaseTaskCallBuilder<ZodTypeAny, ZodTypeAny> {
  private choiceSchema: T

  constructor(choiceSchema: T) {
    super()
    this.choiceSchema = choiceSchema
  }

  public get inputSchema() {
    return FeedbackSelectInputSchema(this.choiceSchema)
  }

  public get outputSchema() {
    return FeedbackSelectOutputSchema(this.choiceSchema)
  }

  private async handleChoices(
    input: types.ParsedData<typeof this.inputSchema>
  ): Promise<types.ParsedData<typeof this.outputSchema>> {
    // Case: input is an array of strings
    const feedback = await select({
      message: [
        'The following inputs were generated:',
        ...input.choices.map(
          (choice, index) => `${index + 1}. ${JSON.stringify(choice, null, 2)}`
        ),
        'What would you like to do?'
      ].join('\n'),
      choices: [
        {
          name: UserActionMessages[UserActions.Accept],
          value: UserActions.Accept
        },
        {
          name: UserActionMessages[UserActions.Edit],
          value: UserActions.Edit
        },
        {
          name: UserActionMessages[UserActions.Decline],
          value: UserActions.Decline
        },
        {
          name: UserActionMessages[UserActions.Select],
          value: UserActions.Select
        }
      ]
    })
    switch (feedback) {
      case UserActions.Edit: {
        const edited = await editor({
          message: 'Edit the input:',
          default: JSON.stringify(input.choices, null, 2)
        })
        return { results: JSON.parse(edited), accepted: true }
      }
      case UserActions.Select: {
        const choices = input.choices.map((completion) => ({
          name: completion,
          value: completion
        }))
        const chosen = await checkbox({
          message: 'Pick items to keep:',
          choices: [...choices]
        })
        if (chosen.length === 0) {
          return { results: [], accepted: false }
        }
        return { results: chosen, accepted: true }
      }
      case UserActions.Decline:
        return { results: [], accepted: false }
      case UserActions.Accept:
        return { results: input.choices, accepted: true }
      default:
        throw new Error('Invalid feedback choice')
    }
  }

  public async call(
    input: types.ParsedData<typeof this.inputSchema>
  ): Promise<types.ParsedData<typeof this.outputSchema>> {
    try {
      input = this.inputSchema.parse(input)
      return this.handleChoices(input)
    } catch (err) {
      console.error('Error parsing input:', err)
      throw err
    }
  }
}
