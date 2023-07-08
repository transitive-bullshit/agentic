import {
  HumanFeedbackMechanism,
  HumanFeedbackType,
  HumanFeedbackUserActions
} from './feedback'

export class HumanFeedbackMechanismDummy<
  T extends HumanFeedbackType,
  TOutput
> extends HumanFeedbackMechanism<T, TOutput> {
  protected async _select(
    output: TOutput
  ): Promise<TOutput extends any[] ? TOutput[0] : never> {
    return output[0] as any
  }

  protected _formatOutput() {
    return ''
  }

  protected async _multiselect(
    output: TOutput
  ): Promise<TOutput extends any[] ? TOutput : never> {
    return output as any
  }

  protected async _annotate(): Promise<string> {
    return 'Default annotation'
  }

  protected async _edit(output: string): Promise<string> {
    return output
  }

  protected async _askUser(): Promise<HumanFeedbackUserActions> {
    return HumanFeedbackUserActions.Accept
  }
}
