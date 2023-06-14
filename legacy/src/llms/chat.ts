import { JSONRepairError, jsonrepair } from 'jsonrepair'
import { dedent } from 'ts-dedent'
import { type SetRequired } from 'type-fest'
import { ZodType, z } from 'zod'
import { printNode, zodToTs } from 'zod-to-ts'

import * as errors from '@/errors'
import * as types from '@/types'
import { getCompiledTemplate } from '@/template'
import {
  extractJSONArrayFromString,
  extractJSONObjectFromString
} from '@/utils'

import { BaseTask } from '../task'
import { BaseLLM } from './llm'
import { getNumTokensForChatMessages } from './llm-utils'

export abstract class BaseChatModel<
  TInput extends void | types.JsonObject = void,
  TOutput extends types.JsonValue = string,
  TModelParams extends Record<string, any> = Record<string, any>,
  TChatCompletionResponse extends Record<string, any> = Record<string, any>
> extends BaseLLM<TInput, TOutput, TModelParams> {
  protected _messages: types.ChatMessage[]
  protected _tools?: BaseTask<any, any>[]

  constructor(
    options: SetRequired<
      types.ChatModelOptions<TInput, TOutput, TModelParams>,
      'provider' | 'model' | 'messages'
    >
  ) {
    super(options)

    this._messages = options.messages
    this._tools = options.tools
  }

  // TODO: use polymorphic `this` type to return correct BaseLLM subclass type
  input<U extends void | types.JsonObject>(
    inputSchema: ZodType<U>
  ): BaseChatModel<U, TOutput, TModelParams> {
    const refinedInstance = this as unknown as BaseChatModel<
      U,
      TOutput,
      TModelParams
    >
    refinedInstance._inputSchema = inputSchema
    return refinedInstance
  }

  // TODO: use polymorphic `this` type to return correct BaseLLM subclass type
  output<U extends types.JsonValue>(
    outputSchema: ZodType<U>
  ): BaseChatModel<TInput, U, TModelParams> {
    const refinedInstance = this as unknown as BaseChatModel<
      TInput,
      U,
      TModelParams
    >
    refinedInstance._outputSchema = outputSchema
    return refinedInstance
  }

  tools(tools: BaseTask<any, any>[]): this {
    if (!this.supportsTools) {
      throw new Error(
        `This Chat model "${this.nameForHuman}" does not support tools`
      )
    }

    this._tools = tools
    return this
  }

  public get supportsTools(): boolean {
    return false
  }

  protected abstract _createChatCompletion(
    messages: types.ChatMessage[]
  ): Promise<types.BaseChatCompletionResponse<TChatCompletionResponse>>

  public async buildMessages(
    input?: TInput,
    ctx?: types.TaskCallContext<TInput>
  ) {
    if (this._inputSchema) {
      // TODO: handle errors gracefully
      input = this.inputSchema.parse(input)
    }

    const messages = this._messages
      .map((message) => {
        return {
          ...message,
          content: message.content
            ? getCompiledTemplate(dedent(message.content))(input).trim()
            : ''
        }
      })
      .filter((message) => message.content)

    if (this._examples?.length) {
      // TODO: smarter example selection
      for (const example of this._examples) {
        messages.push({
          role: 'system',
          content: `Example input: ${example.input}\n\nExample output: ${example.output}`
        })
      }
    }

    if (this._outputSchema) {
      const { node } = zodToTs(this._outputSchema)

      if (node.kind === 152) {
        // handle raw strings differently
        messages.push({
          role: 'system',
          content: dedent`Output a raw string only, without any additional text.`
        })
      } else {
        const tsTypeString = printNode(node, {
          removeComments: false,
          // TODO: this doesn't seem to actually work, so we're doing it manually below
          omitTrailingSemicolon: true,
          noEmitHelpers: true
        })
          .replace(/^ {4}/gm, '  ')
          .replace(/;$/gm, '')

        messages.push({
          role: 'system',
          content: dedent`Do not output code. Output JSON only in the following TypeScript format:
          \`\`\`ts
          ${tsTypeString}
          \`\`\``
        })
      }
    }

    if (ctx?.retryMessage) {
      messages.push({
        role: 'system',
        content: ctx.retryMessage
      })
    }

    // TODO: filter/compress messages based on token counts

    return messages
  }

  protected override async _call(
    ctx: types.TaskCallContext<TInput, types.LLMTaskResponseMetadata>
  ): Promise<TOutput> {
    const messages = await this.buildMessages(ctx.input, ctx)

    console.log('>>>')
    console.log(messages)

    const completion = await this._createChatCompletion(messages)
    ctx.metadata.completion = completion

    let output: any = completion.message.content

    console.log('===')
    console.log(output)
    console.log('<<<')

    if (this._outputSchema) {
      const outputSchema = this._outputSchema

      if (outputSchema instanceof z.ZodArray) {
        try {
          const trimmedOutput = extractJSONArrayFromString(output)
          output = JSON.parse(jsonrepair(trimmedOutput ?? output))
        } catch (err: any) {
          if (err instanceof JSONRepairError) {
            throw new errors.OutputValidationError(err.message, { cause: err })
          } else if (err instanceof SyntaxError) {
            throw new errors.OutputValidationError(
              `Invalid JSON array: ${err.message}`,
              { cause: err }
            )
          } else {
            throw err
          }
        }
      } else if (outputSchema instanceof z.ZodObject) {
        try {
          const trimmedOutput = extractJSONObjectFromString(output)
          output = JSON.parse(jsonrepair(trimmedOutput ?? output))
        } catch (err: any) {
          if (err instanceof JSONRepairError) {
            throw new errors.OutputValidationError(err.message, { cause: err })
          } else if (err instanceof SyntaxError) {
            throw new errors.OutputValidationError(
              `Invalid JSON object: ${err.message}`,
              { cause: err }
            )
          } else {
            throw err
          }
        }
      } else if (outputSchema instanceof z.ZodBoolean) {
        output = output.toLowerCase().trim()
        const booleanOutputs = {
          true: true,
          false: false,
          yes: true,
          no: false,
          1: true,
          0: false
        }

        const booleanOutput = booleanOutputs[output]

        if (booleanOutput !== undefined) {
          output = booleanOutput
        } else {
          throw new errors.OutputValidationError(
            `Invalid boolean output: ${output}`
          )
        }
      } else if (outputSchema instanceof z.ZodNumber) {
        output = output.trim()

        const numberOutput = outputSchema.isInt
          ? parseInt(output)
          : parseFloat(output)

        if (isNaN(numberOutput)) {
          throw new errors.OutputValidationError(
            `Invalid number output: ${output}`
          )
        } else {
          output = numberOutput
        }
      }

      // TODO: this doesn't bode well, batman...
      const safeResult = (outputSchema.safeParse as any)(output)

      if (!safeResult.success) {
        throw new errors.ZodOutputValidationError(safeResult.error)
      }

      return safeResult.data
    } else {
      return output
    }
  }

  public async getNumTokensForMessages(messages: types.ChatMessage[]) {
    return getNumTokensForChatMessages({
      messages,
      model: this._model,
      getNumTokens: this.getNumTokens.bind(this)
    })
  }
}
