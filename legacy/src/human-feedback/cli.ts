import checkbox from '@inquirer/checkbox'
import editor from '@inquirer/editor'
import input from '@inquirer/input'
import select from '@inquirer/select'
import { setTimeout } from 'timers/promises'

import { CancelablePromise } from '@/types'

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
  protected async _askUser(
    message: string,
    choices: HumanFeedbackUserActions[]
  ): Promise<HumanFeedbackUserActions> {
    return this._errorAfterTimeout(
      select({
        message,
        choices: choices.map((choice) => ({
          name: HumanFeedbackUserActionMessages[choice],
          value: choice
        }))
      })
    )
  }

  protected _defaultAfterTimeout(
    promise: CancelablePromise<any>,
    defaultValue: any
  ) {
    if (!isFinite(this._options.timeoutMs)) {
      return promise
    }

    const resolveDefault = setTimeout(this._options.timeoutMs).then(() => {
      promise.cancel()
      return defaultValue
    })
    return Promise.race([resolveDefault, promise])
  }

  protected async _errorAfterTimeout(promise: CancelablePromise<any>) {
    if (!isFinite(this._options.timeoutMs)) {
      return promise
    }

    const rejectError = setTimeout(this._options.timeoutMs).then(() => {
      promise.cancel()
      throw new Error('Timeout waiting for user input')
    })
    return Promise.race([rejectError, promise])
  }

  protected async _edit(output: string): Promise<string> {
    return this._defaultAfterTimeout(
      editor({
        message: 'Edit the output:',
        default: output
      }),
      output
    )
  }

  protected async _annotate(): Promise<string> {
    return this._defaultAfterTimeout(
      input({
        message:
          'Please leave an annotation (leave blank to skip; press enter to submit):'
      }),
      ''
    )
  }

  protected async _select(
    response: TOutput
  ): Promise<TOutput extends (infer U)[] ? U : never> {
    if (!Array.isArray(response)) {
      throw new Error('select called on non-array response')
    }

    const choices = response.map((option) => ({
      name: JSON.stringify(option),
      value: option
    }))
    return this._errorAfterTimeout(
      select({ message: 'Pick one output:', choices })
    )
  }

  protected async _multiselect(
    response: TOutput
  ): Promise<TOutput extends any[] ? TOutput : never> {
    if (!Array.isArray(response)) {
      throw new Error('multiselect called on non-array response')
    }

    const choices = response.map((option) => ({
      name: JSON.stringify(option),
      value: option
    }))
    return this._errorAfterTimeout(
      checkbox({ message: 'Select outputs:', choices })
    )
  }
}
