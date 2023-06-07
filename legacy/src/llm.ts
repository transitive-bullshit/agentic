import { jsonrepair } from 'jsonrepair'
import pMap from 'p-map'
import { dedent } from 'ts-dedent'
import { type SetRequired } from 'type-fest'
import { ZodRawShape, ZodTypeAny, z } from 'zod'
import { printNode, zodToTs } from 'zod-to-ts'

import * as types from './types'
import { BaseTask } from './task'
import { getCompiledTemplate } from './template'
import {
  Tokenizer,
  getModelNameForTiktoken,
  getTokenizerForModel
} from './tokenizer'
import {
  extractJSONArrayFromString,
  extractJSONObjectFromString
} from './utils'

export abstract class BaseLLM<
  TInput extends ZodRawShape | ZodTypeAny = z.ZodVoid,
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodType<string>,
  TModelParams extends Record<string, any> = Record<string, any>
> extends BaseTask<TInput, TOutput> {
  protected _inputSchema: TInput | undefined
  protected _outputSchema: TOutput | undefined

  protected _provider: string
  protected _model: string
  protected _modelParams: TModelParams | undefined
  protected _examples: types.LLMExample[] | undefined
  protected _tokenizer?: Tokenizer | null

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

  input<U extends ZodRawShape | ZodTypeAny = TInput>(
    inputSchema: U
  ): BaseLLM<U, TOutput, TModelParams> {
    ;(this as unknown as BaseLLM<U, TOutput, TModelParams>)._inputSchema =
      inputSchema
    return this as unknown as BaseLLM<U, TOutput, TModelParams>
  }

  output<U extends ZodRawShape | ZodTypeAny = TOutput>(
    outputSchema: U
  ): BaseLLM<TInput, U, TModelParams> {
    ;(this as unknown as BaseLLM<TInput, U, TModelParams>)._outputSchema =
      outputSchema
    return this as unknown as BaseLLM<TInput, U, TModelParams>
  }

  public override get inputSchema(): TInput {
    if (this._inputSchema) {
      return this._inputSchema
    } else {
      return z.void() as TInput
    }
  }

  public override get outputSchema(): TOutput {
    if (this._outputSchema) {
      return this._outputSchema
    } else {
      // TODO: improve typing
      return z.string() as unknown as TOutput
    }
  }

  examples(examples: types.LLMExample[]) {
    this._examples = examples
    return this
  }

  modelParams(params: Partial<TModelParams>) {
    // We assume that modelParams does not include nested objects.
    // If it did, we would need to do a deep merge.
    this._modelParams = { ...this._modelParams, ...params } as TModelParams
    return this
  }

  async getNumTokens(text: string): Promise<number> {
    if (this._tokenizer === undefined) {
      const model = this._model || 'gpt2'

      try {
        this._tokenizer = await getTokenizerForModel(model)
      } catch (err) {
        this._tokenizer = null

        console.warn(
          `Failed to initialize tokenizer for model "${model}", falling back to approximate count`,
          err
        )
      }
    }

    if (this._tokenizer) {
      return this._tokenizer.encode(text).length
    }

    // fallback to approximate calculation if tokenizer is not available
    return Math.ceil(text.length / 4)
  }
}

export abstract class BaseChatModel<
  TInput extends ZodRawShape | ZodTypeAny = ZodTypeAny,
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodType<string>,
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

  protected abstract _createChatCompletion(
    messages: types.ChatMessage[]
  ): Promise<types.BaseChatCompletionResponse<TChatCompletionResponse>>

  public async buildMessages(input?: types.ParsedData<TInput>) {
    if (this._inputSchema) {
      const inputSchema =
        this._inputSchema instanceof z.ZodType
          ? this._inputSchema
          : z.object(this._inputSchema)

      // TODO: handle errors gracefully
      input = inputSchema.parse(input)
    }

    // TODO: validate input message variables against input schema

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
      const outputSchema =
        this._outputSchema instanceof z.ZodType
          ? this._outputSchema
          : z.object(this._outputSchema)

      const { node } = zodToTs(outputSchema)

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

    // TODO: filter/compress messages based on token counts

    return messages
  }

  protected override async _call(
    input?: types.ParsedData<TInput>
  ): Promise<types.TaskResponse<TOutput>> {
    const messages = await this.buildMessages(input)

    console.log('>>>')
    console.log(messages)

    const completion = await this._createChatCompletion(messages)
    let output: any = completion.message.content

    console.log('===')
    console.log(output)
    console.log('<<<')

    if (this._outputSchema) {
      const outputSchema =
        this._outputSchema instanceof z.ZodType
          ? this._outputSchema
          : z.object(this._outputSchema)

      if (outputSchema instanceof z.ZodArray) {
        // TODO: gracefully handle parse errors
        const trimmedOutput = extractJSONArrayFromString(output)
        output = JSON.parse(jsonrepair(trimmedOutput ?? output))
      } else if (outputSchema instanceof z.ZodObject) {
        // TODO: gracefully handle parse errors
        const trimmedOutput = extractJSONObjectFromString(output)
        output = JSON.parse(jsonrepair(trimmedOutput ?? output))
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
          // TODO
          throw new Error(`invalid boolean output: ${output}`)
        }
      } else if (outputSchema instanceof z.ZodNumber) {
        output = output.trim()

        const numberOutput = outputSchema.isInt
          ? parseInt(output)
          : parseFloat(output)

        if (isNaN(numberOutput)) {
          // TODO
          throw new Error(`invalid number output: ${output}`)
        } else {
          output = numberOutput
        }
      }

      // TODO: handle errors, retry logic, and self-healing

      return {
        result: outputSchema.parse(output),
        metadata: {
          input,
          messages,
          completion
        }
      }
    } else {
      return {
        result: output,
        metadata: {
          input,
          messages,
          completion
        }
      }
    }
  }

  async getNumTokensForMessages(messages: types.ChatMessage[]): Promise<{
    numTokensTotal: number
    numTokensPerMessage: number[]
  }> {
    let numTokensTotal = 0
    let tokensPerMessage = 0
    let tokensPerName = 0

    const modelName = getModelNameForTiktoken(this._model)

    if (modelName === 'gpt-3.5-turbo') {
      tokensPerMessage = 4
      tokensPerName = -1
    } else if (modelName.startsWith('gpt-4')) {
      tokensPerMessage = 3
      tokensPerName = 1
    } else {
      // TODO
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

    numTokensTotal += 3 // every reply is primed with <|start|>assistant<|message|>

    return { numTokensTotal, numTokensPerMessage }
  }
}
