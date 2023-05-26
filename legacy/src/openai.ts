import { jsonrepair } from 'jsonrepair'
import Mustache from 'mustache'
import { dedent } from 'ts-dedent'
import type { SetRequired } from 'type-fest'
import { ZodRawShape, ZodTypeAny, z } from 'zod'
import { printNode, zodToTs } from 'zod-to-ts'

import * as types from './types'
import { defaultOpenAIModel } from './constants'
import { ChatModelBuilder } from './llm'
import {
  extractJSONArrayFromString,
  extractJSONObjectFromString
} from './utils'

export class OpenAIChatModelBuilder<
  TInput extends ZodRawShape | ZodTypeAny = ZodTypeAny,
  TOutput extends ZodRawShape | ZodTypeAny = z.ZodType<string>
> extends ChatModelBuilder<
  TInput,
  TOutput,
  SetRequired<Omit<types.openai.ChatCompletionParams, 'messages'>, 'model'>
> {
  _client: types.openai.OpenAIClient

  constructor(
    client: types.openai.OpenAIClient,
    options: types.ChatModelOptions<
      TInput,
      TOutput,
      Omit<types.openai.ChatCompletionParams, 'messages'>
    >
  ) {
    super({
      provider: 'openai',
      model: defaultOpenAIModel,
      ...options
    })

    this._client = client
  }

  override async call(
    input?: types.ParsedData<TInput>
  ): Promise<types.ParsedData<TOutput>> {
    if (this._options.input) {
      const inputSchema =
        this._options.input instanceof z.ZodType
          ? this._options.input
          : z.object(this._options.input)

      // TODO: handle errors gracefully
      input = inputSchema.parse(input)
    }

    // TODO: validate input message variables against input schema

    const messages = this._messages
      .map((message) => {
        return {
          ...message,
          content: message.content
            ? Mustache.render(dedent(message.content), input).trim()
            : ''
        }
      })
      .filter((message) => message.content)

    if (this._options.examples?.length) {
      // TODO: smarter example selection
      for (const example of this._options.examples) {
        messages.push({
          role: 'system',
          content: `Example input: ${example.input}\n\nExample output: ${example.output}`
        })
      }
    }

    if (this._options.output) {
      const outputSchema =
        this._options.output instanceof z.ZodType
          ? this._options.output
          : z.object(this._options.output)

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
          .replace(/^    /gm, '  ')
          .replace(/;$/gm, '')

        messages.push({
          role: 'system',
          content: dedent`Output JSON only in the following format:
          \`\`\`ts
          ${tsTypeString}
          \`\`\``
        })
      }
    }

    // TODO: filter/compress messages based on token counts

    console.log('>>>')
    console.log(messages)
    const completion = await this._client.createChatCompletion({
      model: defaultOpenAIModel, // TODO: this shouldn't be necessary but TS is complaining
      ...this._options.modelParams,
      messages
    })

    if (this._options.output) {
      const outputSchema =
        this._options.output instanceof z.ZodType
          ? this._options.output
          : z.object(this._options.output)

      let output: any = completion.message.content
      console.log('===')
      console.log(output)
      console.log('<<<')

      if (outputSchema instanceof z.ZodArray) {
        try {
          const trimmedOutput = extractJSONArrayFromString(output)
          output = JSON.parse(jsonrepair(trimmedOutput ?? output))
        } catch (err) {
          // TODO
          throw err
        }
      } else if (outputSchema instanceof z.ZodObject) {
        try {
          const trimmedOutput = extractJSONObjectFromString(output)
          output = JSON.parse(jsonrepair(trimmedOutput ?? output))
        } catch (err) {
          // TODO
          throw err
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
          throw new Error(`invalid boolean output: ${output}`)
        }
      } else if (outputSchema instanceof z.ZodNumber) {
        output = output.trim()

        const numberOutput = outputSchema.isInt
          ? parseInt(output)
          : parseFloat(output)

        if (isNaN(numberOutput)) {
          throw new Error(`invalid number output: ${output}`)
        } else {
          output = numberOutput
        }
      }

      // TODO: handle errors, retry logic, and self-healing

      return outputSchema.parse(output)
    } else {
      return completion.message.content as any
    }
  }
}
