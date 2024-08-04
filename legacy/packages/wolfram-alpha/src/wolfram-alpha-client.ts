import {
  aiFunction,
  AIFunctionsProvider,
  assert,
  getEnv,
  sanitizeSearchParams
} from '@agentic/core'
import defaultKy, { type KyInstance } from 'ky'
import { z } from 'zod'

export namespace wolframalpha {
  export const API_BASE_URL = 'https://www.wolframalpha.com/api/'

  export const AskWolframAlphaOptionsSchema = z.object({
    input: z.string().describe('english query'),
    maxchars: z
      .number()
      .int()
      .positive()
      .default(6000)
      .optional()
      .describe('max characters to generate in the response')
  })
  export type AskWolframAlphaOptions = z.infer<
    typeof AskWolframAlphaOptionsSchema
  >
}

/**
 * Wolfram Alpha LLM API client for answering computational, mathematical, and
 * scientific questions.
 *
 * @see https://products.wolframalpha.com/llm-api/documentation
 */
export class WolframAlphaClient extends AIFunctionsProvider {
  protected readonly ky: KyInstance
  protected readonly appId: string
  protected readonly apiBaseUrl: string

  constructor({
    appId = getEnv('WOLFRAM_APP_ID'),
    apiBaseUrl = wolframalpha.API_BASE_URL,
    ky = defaultKy
  }: {
    appId?: string
    apiBaseUrl?: string
    ky?: KyInstance
  } = {}) {
    assert(
      appId,
      'WolframAlphaClient missing required "appId" (defaults to "WOLFRAM_APP_ID")'
    )
    super()

    this.appId = appId
    this.apiBaseUrl = apiBaseUrl

    this.ky = ky.extend({
      prefixUrl: apiBaseUrl,
      headers: {
        Authorization: `Bearer ${appId}`
      }
    })
  }

  @aiFunction({
    name: 'ask_wolfram_alpha',
    description: `
- WolframAlpha understands natural language queries about entities in chemistry, physics, geography, history, art, astronomy, and more.
- WolframAlpha performs mathematical calculations, date and unit conversions, formula solving, etc.
- Convert inputs to simplified keyword queries whenever possible (e.g. convert "how many people live in France" to "France population").
- Send queries in English only; translate non-English queries before sending, then respond in the original language.
- ALWAYS use this exponent notation: \`6*10^14\`, NEVER \`6e14\`.
- ALWAYS use proper Markdown formatting for all math, scientific, and chemical formulas, symbols, etc.:  '$$\n[expression]\n$$' for standalone cases and '( [expression] )' when inline.
- Use ONLY single-letter variable names, with or without integer subscript (e.g., n, n1, n_1).
- Use named physical constants (e.g., 'speed of light') without numerical substitution.
- Include a space between compound units (e.g., "Ω m" for "ohm*meter").
- To solve for a variable in an equation with units, consider solving a corresponding equation without units; exclude counting units (e.g., books), include genuine units (e.g., kg).
- If a WolframAlpha result is not relevant to the query:
  - If Wolfram provides multiple 'Assumptions' for a query, choose the more relevant one(s) without explaining the initial result. If you are unsure, ask the user to choose.
  - Re-send the exact same 'input' with NO modifications, and add the 'assumption' parameter, formatted as a list, with the relevant values.
  - ONLY simplify or rephrase the initial query if a more relevant 'Assumption' or other input suggestions are not provided.
`.trim(),
    inputSchema: wolframalpha.AskWolframAlphaOptionsSchema
  })
  async ask(queryOrOptions: string | wolframalpha.AskWolframAlphaOptions) {
    const options =
      typeof queryOrOptions === 'string'
        ? { input: queryOrOptions }
        : queryOrOptions

    return this.ky
      .get('v1/llm-api', { searchParams: sanitizeSearchParams(options) })
      .text()
  }
}
