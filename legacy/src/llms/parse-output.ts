import { JSONRepairError, jsonrepair } from 'jsonrepair'
import { ZodType, z } from 'zod'

import * as errors from '@/errors'
import {
  extractJSONArrayFromString,
  extractJSONObjectFromString
} from '@/utils'

const BOOLEAN_OUTPUTS = {
  true: true,
  false: false,
  t: true,
  f: false,
  yes: true,
  no: false,
  y: true,
  n: false,
  '1': true,
  '0': false
}

/**
 * Parses an array output from a string.
 *
 * @param output - string to parse
 * @returns parsed array
 */
export function parseArrayOutput(output: string): Array<any> {
  try {
    const trimmedOutput = extractJSONArrayFromString(output)
    const parsedOutput = JSON.parse(jsonrepair(trimmedOutput ?? output))
    if (!Array.isArray(parsedOutput)) {
      throw new errors.OutputValidationError(
        `Invalid JSON array: ${JSON.stringify(parsedOutput)}`
      )
    }

    return parsedOutput
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
}

/**
 * Parses an object output from a string.
 *
 * @param output - string to parse
 * @returns parsed object
 */
export function parseObjectOutput(output: string) {
  try {
    const trimmedOutput = extractJSONObjectFromString(output)
    output = JSON.parse(jsonrepair(trimmedOutput ?? output))

    if (Array.isArray(output)) {
      // TODO
      output = output[0]
    } else if (typeof output !== 'object') {
      throw new errors.OutputValidationError(
        `Invalid JSON object: ${JSON.stringify(output)}`
      )
    }

    return output
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
}

/**
 * Parses a boolean output from a string.
 *
 * @param output - string to parse
 * @returns parsed boolean
 */
export function parseBooleanOutput(output: string): boolean {
  output = output
    .toLowerCase()
    .trim()
    .replace(/[.!?]+$/, '')

  const booleanOutput = BOOLEAN_OUTPUTS[output]

  if (booleanOutput !== undefined) {
    return booleanOutput
  } else {
    throw new errors.OutputValidationError(`Invalid boolean output: ${output}`)
  }
}

/**
 * Parses a number output from a string.
 *
 * @param output - string to parse
 * @param outputSchema - zod number schema
 * @returns parsed number
 */
export function parseNumberOutput(
  output: string,
  outputSchema: z.ZodNumber
): number {
  output = output.trim()

  const numberOutput = outputSchema.isInt
    ? parseInt(output)
    : parseFloat(output)

  if (isNaN(numberOutput)) {
    throw new errors.OutputValidationError(`Invalid number output: ${output}`)
  }

  return numberOutput
}

/**
 * Parses an output value from a string.
 *
 * @param output - string to parse
 * @param outputSchema - zod schema
 * @returns parsed output
 */
export function parseOutput(output: string, outputSchema: ZodType<any>) {
  let result
  if (outputSchema instanceof z.ZodArray) {
    result = parseArrayOutput(output)
  } else if (outputSchema instanceof z.ZodObject) {
    result = parseObjectOutput(output)
  } else if (outputSchema instanceof z.ZodBoolean) {
    result = parseBooleanOutput(output)
  } else if (outputSchema instanceof z.ZodNumber) {
    result = parseNumberOutput(output, outputSchema)
  } else {
    result = output
  }

  // TODO: fix typescript issue here with recursive types
  const safeResult = (outputSchema.safeParse as any)(result)

  if (!safeResult.success) {
    throw new errors.ZodOutputValidationError(safeResult.error)
  }

  return safeResult.data
}
