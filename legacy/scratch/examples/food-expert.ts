import 'dotenv/config'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic } from '@/agentic'

// import { summaryAgent } from './summary'

async function main() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const $ = new Agentic({ openai })

  ///////////////////////////
  // Learn about new food everyday and stay up to date
  ///////////////////////////

  // const countryIsoValidation = `/^A[^ABCHJKNPVY]|B[^CKPUX]|C
  // [^BEJPQST]|D[EJKMOZ]|E[CEGHRST]|F[IJKMOR]|G[^CJ
  // KOVXZ]|H[KMNRTU]|I[DEL-OQ-T]|J[EMOP]|K[EGHIMNPR
  // WYZ]|L[ABCIKR-VY]|M[^BIJ]|N[ACEFGILOPRUZ]|OM|P[
  // AE-HK-NRSTWY]|QA|R[EOSUW]|S[^FPQUW]|T[^ABEIPQSU
  // XY]|U[AGMSYZ]|V[ACEGINU]|WF|WS|YE|YT|Z[AMW]$/ix`

  const foodSchema = z.object({
    name: z.string(),
    countryOfOrigin: z.string(),
    ingredients: z.string().array(),
    linkToLearnMore: z.string()
  })

  const foodAgent = await $.gpt4(
    `You are a world food expert. Provide me with a new food to learn about. My dietary restrictions are: {{dietaryRestrictions}}`
  )
    .input(z.object({ dietaryRestrictions: z.string().array() }))
    .output(foodSchema)
    // .assert( (output) => {
    //   z.string().url(output.linkToLearnMore)
    // })
    // .assertRegex({
    //   value: output => output.countryOfOrigin,
    //   regex: countryIsoValidation,
    //   message: 'Country of origin must be a valid ISO 3166-1 alpha-2 country code',
    //   retry: true
    // })
    .call({
      dietaryRestrictions: ['vegan', 'vegetarian', 'gluten-free']
    })

  // TODO
  // const article = await $.browse(foodAgent.linkToLearnMore)
  // const summary = await summaryAgent.call({ article })

  // const email = await $.gpt4(
  //   `Here is a summary of an article about food: {{summary}}.
  //   Here is some more information about the food: {{foodInfo}}.
  //   Write a nice email that I can send to myself that includes the summary and the food info.
  //   Make it fun and interesting.`
  // )
  //   .input(z.object({ summary: z.string(), foodInfo: foodSchema }))
  //   .output(z.string())

  // sendEmail(email)
}

main()
