import type { z } from 'zod'

import type * as types from './types'
import { parseStructuredOutput } from './parse-structured-output'
import { assert } from './utils'
import { zodToJsonSchema } from './zod-to-json-schema'

/**
 * Create a function meant to be used with OpenAI tool or function calling.
 *
 * The returned function will parse the arguments string and call the
 * implementation function with the parsed arguments.
 *
 * The `spec` property of the returned function is the spec for adding the
 * function to the OpenAI API `functions` property.
 */
export function createAIFunction<InputSchema extends z.ZodObject<any>, Output>(
  spec: {
    /** Name of the function. */
    name: string
    /** Description of the function. */
    description?: string
    /** Zod schema for the function parameters. */
    inputSchema: InputSchema
    /**
     * Whether or not to enable structured output generation based on the given
     * zod schema.
     */
    strict?: boolean
  },
  /** Implementation of the function to call with the parsed arguments. */
  implementation: (params: z.infer<InputSchema>) => types.MaybePromise<Output>
): types.AIFunction<InputSchema, Output> {
  assert(spec.name, 'createAIFunction missing required "spec.name"')
  assert(
    spec.inputSchema,
    'createAIFunction missing required "spec.inputSchema"'
  )
  assert(implementation, 'createAIFunction missing required "implementation"')
  assert(
    typeof implementation === 'function',
    'createAIFunction "implementation" must be a function'
  )

  /** Parse the arguments string, optionally reading from a message. */
  const parseInput = (input: string | types.Msg) => {
    if (typeof input === 'string') {
      return parseStructuredOutput(input, spec.inputSchema)
    } else {
      const args = input.function_call?.arguments
      assert(
        args,
        `Missing required function_call.arguments for function ${spec.name}`
      )
      return parseStructuredOutput(args, spec.inputSchema)
    }
  }

  // Call the implementation function with the parsed arguments.
  const aiFunction: types.AIFunction<InputSchema, Output> = (
    input: string | types.Msg
  ) => {
    const parsedInput = parseInput(input)
    return implementation(parsedInput)
  }

  const strict = !!spec.strict

  aiFunction.inputSchema = spec.inputSchema
  aiFunction.parseInput = parseInput
  aiFunction.spec = {
    name: spec.name,
    description: spec.description?.trim() ?? '',
    parameters: zodToJsonSchema(spec.inputSchema, { strict }),
    strict
  }
  aiFunction.impl = implementation

  return aiFunction
}
