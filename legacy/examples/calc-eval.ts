import 'dotenv/config'
import { OpenAIClient } from 'openai-fetch'
import { z } from 'zod'

import { Agentic } from '../src'
import { getProblems } from './fixtures/calc'

export async function calcEval() {
  const openai = new OpenAIClient({ apiKey: process.env.OPENAI_API_KEY! })
  const $ = new Agentic({ openai })

  const problemSet = getProblems()

  Object.entries(problemSet).map(async ([setName, problems]) => {
    console.log('running set', setName)

    const setExamples = problems.slice(0, 1).map(({ question, expected }) => ({
      input: question,
      output: expected
    }))
    const answers = await Promise.all(
      problems.slice(2).map(({ question, expected }) => {
        return (async () =>
          $.gpt4(question)
            .output(z.string())
            .examples(setExamples)
            // .assert((output) => output === expected)
            .call())()
      })
    )

    console.log(
      `========
Results for ${setName}
<expected> : <actual> | <Result< ✅ | ❌ >
=======`
    )
    problems.slice(2).forEach((problem, i) => {
      console.log(
        `${problem.expected} : ${answers[i]} | ${
          problem.expected === answers[i] ? '✅' : '❌'
        }}`
      )
    })
  })
}

calcEval()
