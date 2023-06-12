import { JSONRepairError, jsonrepair } from 'jsonrepair'
import pMap from 'p-map'
import { dedent } from 'ts-dedent'
import { type SetRequired } from 'type-fest'
import { ZodType, z } from 'zod'
import { printNode, zodToTs } from 'zod-to-ts'

import * as errors from '@/errors'
import * as types from '@/types'
import { BaseTask } from '@/task'
import { getCompiledTemplate } from '@/template'
import {
  Tokenizer,
  getModelNameForTiktoken,
  getTokenizerForModel
} from '@/tokenizer'
import {
  extractJSONArrayFromString,
  extractJSONObjectFromString
} from '@/utils'

// TODO: TInput should only be allowed to be void or an object
export abstract class BaseLLM<
  TInput = void,
  TOutput = string,
  TModelParams extends Record<string, any> = Record<string, any>
> extends BaseTask<TInput, TOutput> {
  protected _inputSchema: ZodType<TInput> | undefined
  protected _outputSchema: ZodType<TOutput> | undefined

  protected _provider: string
  protected _model: string
  protected _modelParams: TModelParams | undefined
  protected _examples: types.LLMExample[] | undefined
  protected _tokenizerP?: Promise<Tokenizer | null>

  constructor(
    options: SetRequired<
      types.BaseLLMOptions<TInput, TOutput, TModelParams>,
      'provider' | 'model'
    >
  ) {
    super(options)

    this._inputSchema = options.inputSchema
    this._outputSchema = options.outputSchema

    this._provider = options.provider
    this._model = options.model
    this._modelParams = options.modelParams
    this._examples = options.examples
  }

  // TODO: use polymorphic `this` type to return correct BaseLLM subclass type
  input<U>(inputSchema: ZodType<U>): BaseLLM<U, TOutput, TModelParams> {
    const refinedInstance = this as unknown as BaseLLM<U, TOutput, TModelParams>
    refinedInstance._inputSchema = inputSchema
    return refinedInstance
  }

  // TODO: use polymorphic `this` type to return correct BaseLLM subclass type
  output<U>(outputSchema: ZodType<U>): BaseLLM<TInput, U, TModelParams> {
    const refinedInstance = this as unknown as BaseLLM<TInput, U, TModelParams>
    refinedInstance._outputSchema = outputSchema
    return refinedInstance
  }

  public override get inputSchema(): ZodType<TInput> {
    if (this._inputSchema) {
      return this._inputSchema
    } else {
      // TODO: improve typing
      return z.void() as unknown as ZodType<TInput>
    }
  }

  public override get outputSchema(): ZodType<TOutput> {
    if (this._outputSchema) {
      return this._outputSchema
    } else {
      // TODO: improve typing
      return z.string() as unknown as ZodType<TOutput>
    }
  }

  public override get name(): string {
    return `${this._provider}:chat:${this._model}`
  }

  examples(examples: types.LLMExample[]): this {
    this._examples = examples
    return this
  }

  modelParams(params: Partial<TModelParams>): this {
    // We assume that modelParams does not include nested objects.
    // If it did, we would need to do a deep merge.
    this._modelParams = { ...this._modelParams, ...params } as TModelParams
    return this
  }

  public async getNumTokens(text: string): Promise<number> {
    if (!this._tokenizerP) {
      const model = this._model || 'gpt2'

      this._tokenizerP = getTokenizerForModel(model).catch((err) => {
        console.warn(
          `Failed to initialize tokenizer for model "${model}", falling back to approximate count`,
          err
        )

        return null
      })
    }

    const tokenizer = await this._tokenizerP

    if (tokenizer) {
      return tokenizer.encode(text).length
    }

    // fallback to approximate calculation if tokenizer is not available
    return Math.ceil(text.length / 4)
  }
}

export abstract class BaseChatModel<
  TInput = void,
  TOutput = string,
  TModelParams extends Record<string, any> = Record<string, any>,
  TChatCompletionResponse extends Record<string, any> = Record<string, any>
> extends BaseLLM<TInput, TOutput, TModelParams> {
  _messages: types.ChatMessage[]

  constructor(
    options: SetRequired<
      types.ChatModelOptions<TInput, TOutput, TModelParams>,
      'provider' | 'model' | 'messages'
    >
  ) {
    super(options)

    this._messages = options.messages
  }

  // TODO: use polymorphic `this` type to return correct BaseLLM subclass type
  input<U>(inputSchema: ZodType<U>): BaseChatModel<U, TOutput, TModelParams> {
    const refinedInstance = this as unknown as BaseChatModel<
      U,
      TOutput,
      TModelParams
    >
    refinedInstance._inputSchema = inputSchema
    return refinedInstance
  }

  // TODO: use polymorphic `this` type to return correct BaseLLM subclass type
  output<U>(outputSchema: ZodType<U>): BaseChatModel<TInput, U, TModelParams> {
    const refinedInstance = this as unknown as BaseChatModel<
      TInput,
      U,
      TModelParams
    >
    refinedInstance._outputSchema = outputSchema
    return refinedInstance
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

    // TODO: validate input message variables against input schema
    console.log({ input })

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

      const safeResult = outputSchema.safeParse(output)

      if (!safeResult.success) {
        throw new errors.ZodOutputValidationError(safeResult.error)
      }

      return safeResult.data
    } else {
      return output
    }
  }

  // TODO: this needs work + testing
  // TODO: move to isolated file and/or module
  public async getNumTokensForMessages(messages: types.ChatMessage[]): Promise<{
    numTokensTotal: number
    numTokensPerMessage: number[]
  }> {
    let numTokensTotal = 0
    let tokensPerMessage = 0
    let tokensPerName = 0

    const modelName = getModelNameForTiktoken(this._model)

    // https://github.com/openai/openai-cookbook/blob/main/examples/How_to_format_inputs_to_ChatGPT_models.ipynb
    if (modelName === 'gpt-3.5-turbo') {
      tokensPerMessage = 4
      tokensPerName = -1
    } else if (modelName.startsWith('gpt-4')) {
      tokensPerMessage = 3
      tokensPerName = 1
    } else {
      // TODO
      tokensPerMessage = 4
      tokensPerName = -1
    }

    const numTokensPerMessage = await pMap(
      messages,
      async (message) => {
        const [numTokensContent, numTokensRole, numTokensName] =
          await Promise.all([
            this.getNumTokens(message.content),
            this.getNumTokens(message.role),
            message.name
              ? this.getNumTokens(message.name).then((n) => n + tokensPerName)
              : Promise.resolve(0)
          ])

        const numTokens =
          tokensPerMessage + numTokensContent + numTokensRole + numTokensName

        numTokensTotal += numTokens
        return numTokens
      },
      {
        concurrency: 8
      }
    )

    // TODO
    numTokensTotal += 3 // every reply is primed with <|start|>assistant<|message|>

    return { numTokensTotal, numTokensPerMessage }
  }
}
